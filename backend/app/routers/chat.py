import json

from fastapi import APIRouter, Cookie, WebSocket, WebSocketDisconnect, Query
from pydantic import BaseModel, ConfigDict, Field, ValidationError
from typing import Dict, Set
from app.security import verify_token


MAX_MESSAGE_LENGTH = 500


class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sender: str
    text: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)


class ChatResponse(BaseModel):
    status: str
    received: ChatMessage
    info: str


router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatResponse)
def post_message(message: ChatMessage) -> ChatResponse:
    return ChatResponse(
        status="ok",
        received=message,
        info="Message received successfully",
    )


# --- WebSocket support ---
class ConnectionManager:
    def __init__(self) -> None:
        # map room -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, room: str) -> None:
        await websocket.accept()
        conns = self.active_connections.setdefault(room, set())
        conns.add(websocket)

    def disconnect(self, websocket: WebSocket, room: str) -> None:
        conns = self.active_connections.get(room)
        if not conns:
            return
        if websocket in conns:
            conns.remove(websocket)
        if len(conns) == 0:
            # clean up empty room
            del self.active_connections[room]

    async def send_personal_message(self, message: str, websocket: WebSocket) -> None:
        await websocket.send_text(message)

    async def broadcast(self, message: str, room: str) -> None:
        conns = list(self.active_connections.get(room, set()))
        for conn in conns:
            try:
                await conn.send_text(message)
            except Exception:
                # if send fails, remove connection
                try:
                    self.active_connections[room].remove(conn)
                except Exception:
                    pass


manager = ConnectionManager()


@router.websocket("/ws/{room}")
async def websocket_endpoint(
    websocket: WebSocket,
    room: str,
    token: str | None = Query(default=None),
    access_token: str | None = Cookie(default=None),
) -> None:
    # Verify token before accepting connection.
    jwt_token = token or access_token
    username = verify_token(jwt_token) if jwt_token else None
    if not username:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(websocket, room)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                try:
                    payload = json.loads(data)
                except json.JSONDecodeError:
                    payload = {"text": data}

                if isinstance(payload, str):
                    payload = {"text": payload}
                if not isinstance(payload, dict):
                    raise ValueError("Message payload must be a JSON object or plain text")

                payload["sender"] = username
                validated = ChatMessage.model_validate(payload)
                message = json.dumps({"sender": validated.sender, "text": validated.text})
            except (TypeError, ValueError, ValidationError):
                await websocket.close(code=1008, reason="Invalid message payload")
                return

            await manager.broadcast(message, room)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)

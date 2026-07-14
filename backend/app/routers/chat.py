from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, Set


class ChatMessage(BaseModel):
    sender: str
    text: str


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
async def websocket_endpoint(websocket: WebSocket, room: str) -> None:
    await manager.connect(websocket, room)
    try:
        while True:
            data = await websocket.receive_text()
            # broadcast received text to all clients in the room
            await manager.broadcast(data, room)
    except WebSocketDisconnect:
        manager.disconnect(websocket, room)

from fastapi import APIRouter
from pydantic import BaseModel


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

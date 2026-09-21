import asyncio
import argparse
from urllib.parse import quote

import websockets


async def run(token: str, room: str) -> None:
    uri = f"ws://127.0.0.1:8000/chat/ws/{quote(room, safe='')}?token={quote(token, safe='')}"
    async with websockets.connect(uri) as ws:
        await ws.send("hello from python client")
        msg = await ws.recv()
        print("RECV:", msg)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Test an authenticated ChatHub WebSocket")
    parser.add_argument("--token", required=True, help="JWT access token from /auth/login")
    parser.add_argument("--room", default="testroom", help="Chat room to join")
    args = parser.parse_args()
    asyncio.run(run(args.token, args.room))

import asyncio
import websockets

async def test():
    uri = "ws://127.0.0.1:8000/chat/ws/testroom"
    async with websockets.connect(uri) as ws:
        await ws.send("hello from python client")
        msg = await ws.recv()
        print("RECV:", msg)

if __name__ == '__main__':
    asyncio.run(test())

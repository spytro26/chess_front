import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useSocket } from "../hooks/useSocket";
import { Chess } from 'chess.js'

// TODO: Move together, there's code repetition here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
    const socket = useSocket();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false)
    const [side, setside] = useState<"w" | "b">("b");
    const [chance, setChance] = useState<boolean>(false); // Move state here
    const [winner , setWinner] = useState<'w' | "b" | null> (null);
   const [check , setCheck] = useState<boolean> (false);
    useEffect(() => {
        if (!socket) {
            return;
        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch (message.type) {
                case INIT_GAME:
                    setBoard(chess.board());
                    setStarted(true)
                    if (message.payload.color == 'white') {
                        setside('w');
                        setChance(true)
                    }
                    break;
                case MOVE:
                    const move = message.payload;
                    console.log("move recive hua hai bhai", move);
                    chess.move(move);
                    setBoard(chess.board());
                    console.log("Move made");
                    setChance(true)
                     setCheck(chess.inCheck()) 
                     
                    break;
                case GAME_OVER:
                    console.log("Game over");
                    setWinner(message.payload.winner);
                    setChance(false)
                    break;
                case "promote" : 
                      console.log("promoting");
                       setCheck(chess.inCheck()) 
                     
                       chess.move({
                      from: message.payload.from,
                     to: message.payload.to,
                        promotion: message.pawn, // "q" | "r" | "n" | "b"
                    });
                    setBoard(chess.board());
                      console.log("Move made");
                       setChance(true);

            }
        }


    }, [socket]);

    if (!socket) return <div>Connecting...</div>

    return <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    {started && <ChessBoard 
                        side={side} 
                        setCheck={setCheck}
                        check = {check}
                        chess={chess} 
                        setBoard={setBoard} 
                        winner = {winner}
                        socket={socket} 
                        board={board} 
                        chance={chance}
                        setChance={setChance}
                    />}
                </div>
                <div className="col-span-2 bg-slate-900 w-full flex justify-center">
                    <div className="pt-8">
                        {!started && <Button onClick={() => {
                            socket.send(JSON.stringify({
                                type: INIT_GAME
                            }));
                            setStarted(false)

                        }} >
                            Play
                        </Button>}
                    </div>
                </div>
            </div>
        </div>
    </div>
}
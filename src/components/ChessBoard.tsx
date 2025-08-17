import { Chess } from "chess.js";
import type { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({
  side,
  chess,
  board,
  socket,
  setBoard,
  chance,
  setChance,
}: {
  side: "w" | "b";
  chess: Chess;
  setBoard: React.Dispatch<
    React.SetStateAction<
      (
        | {
            square: Square;
            type: PieceSymbol;
            color: Color;
          }
        | null
      )[][]
    >
  >;
  board: (
    | {
        square: Square;
        type: PieceSymbol;
        color: Color;
      }
    | null
  )[][];
  socket: WebSocket;
  chance: boolean;
  setChance: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [from, setFrom] = useState<null | Square>(null);

  // Handle actual move
  const handleMove = (from: Square, to: Square) => {
    try {
      socket.send(
        JSON.stringify({
          type: MOVE,
          payload: { move: { from, to } },
        })
      );

      chess.move({ from, to });
      setBoard(chess.board());
      setChance(false);
      console.log("Moved:", { from, to });
    } catch (error) {
      console.error("Invalid move", error);
    }
    setFrom(null);
  };

  // Renders a square
  const renderSquare = (
    square: { square: Square; type: PieceSymbol; color: Color } | null,
    squareRepresentation: Square,
    isLight: boolean
  ) => {
    return (
      <div
        key={squareRepresentation}
        className={`w-16 h-16 ${
          isLight ? "bg-green-500" : "bg-slate-500"
        } ${from === squareRepresentation ? "ring-2 ring-yellow-400" : ""}`}
        onDragOver={(e) => e.preventDefault()} // allow drop
        onDrop={() => {
          if (from && chance) {
            handleMove(from, squareRepresentation);
          }
        }}
        onClick={() => {
          if (!from && chance) {
            setFrom(squareRepresentation);
          } else if (from && chance) {
            handleMove(from, squareRepresentation);
          }
        }}
      >
        <div className="w-full h-full flex justify-center items-center">
          {square ? (
            <img
              draggable={chance} // enable drag only if it's user's turn
              onDragStart={() => {
                if (chance) {
                  setFrom(squareRepresentation);
                }
              }}
              className="w-10 select-none"
              src={`/${
                square.color === "b"
                  ? square.type
                  : `${square.type?.toUpperCase()} copy`
              }.png`}
            />
          ) : null}
        </div>
      </div>
    );
  };

  // White side
  if (side === "w") {
    return (
      <div className="text-white-200">
        {board.map((row, i) => (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const squareRepresentation =
                String.fromCharCode(97 + (j % 8)) + "" + (8 - i);
              return renderSquare(
                square,
                squareRepresentation as Square,
                (i + j) % 2 === 0
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // Black side
  if (side === "b") {
    return (
      <div className="text-white-200">
        {board
          .slice()
          .reverse()
          .map((row, i) => {
            const actualRowIndex = 7 - i;
            return (
              <div key={i} className="flex">
                {row
                  .slice()
                  .reverse()
                  .map((square, j) => {
                    const actualColIndex = 7 - j;
                    const squareRepresentation =
                      String.fromCharCode(97 + actualColIndex) +
                      "" +
                      (8 - actualRowIndex);
                    return renderSquare(
                      square,
                      squareRepresentation as Square,
                      (actualRowIndex + actualColIndex) % 2 === 0
                    );
                  })}
              </div>
            );
          })}
      </div>
    );
  }

  return null;
};

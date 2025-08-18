import { Chess } from "chess.js";
import type { Color, PieceSymbol, Square } from "chess.js";
import { useState  } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({
  side,
  winner , 
  chess,
  check,
  board,
  socket,
  setCheck,
  setBoard,
  chance,
  setChance,
} : {
  side: "w" | "b";
  chess: Chess;
  check : any; 
  setCheck : any ; 
  winner : 'b' | 'w' | null;
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
  const [moves , setMoves] = useState<any>();
  const [upgrade , setUpgrade] = useState <boolean> (false) ; 
  const [pawn , setPawn ] = useState <PieceSymbol> ();
   const [pending , setPending]  = useState<any> ();

   
 
  const handleMove = (from: Square, to: Square, square :  { square: Square; type: PieceSymbol; color: Color } | null) => {
   if (
  ["a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7"].includes(from) &&
  chess.get(from)?.color === "w" &&
chess.get(from)?.type === "p" &&

  ["a8", "b8" , "c8" , "d8", "e8" , "f8" , "g8", "h8"].includes(to)  
) {
    console.log("upgrade detected");
 setUpgrade(true);
 setPending({from , to , square});
   setFrom(null);
   setMoves(null);
   setChance(false);
return ; 


}







  if (
  ["a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2"].includes(from) &&
 chess.get(from)?.color === "w" &&
chess.get(from)?.type === "p" &&

  ["a1", "b1" , "c1" , "d1", "e1" , "f1" , "g1", "h1"].includes(to)  
) {
    console.log("upgrade detected");
 setUpgrade(true);
 setPending({from , to , square});
   setFrom(null);
   setMoves(null);
   setChance(false);
return ; 


}



    setMoves(null)
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
      setCheck(false);
      console.log("Moved:", { from, to });
    } catch (error) {
      console.error("Invalid move", error);
    }

    setFrom(null);
  };




  const doPromote = ( piece : PieceSymbol)=>{

    console.log("promoting babes");
    console.log(pending);
 try {
   socket.send(
        JSON.stringify({
          type: "promote",
          payload: { move:  pending   },
          piece : piece ||  pawn
        })
      );


      chess.move({from : pending.from , to : pending.to , promotion : piece});
         setBoard(chess.board());
    setUpgrade(false);  //
    setPending(null);   // clear pending move
    setChance(false);   //  end turn


} catch(e){
    console.log("unable to promote the pawn ")
}





  }

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
          // square.PieceSymbol
        } ${from === squareRepresentation ? "ring-2 ring-yellow-400" : ""}
         ${square?.type == 'k' && check && square?.color === side ? "ring-4 ring-red-500" : ""} 
        `}
        onDragOver={(e) => e.preventDefault()} // allow drop
        onDrop={() => {
          if (from && chance) {
            handleMove(from, squareRepresentation,square);
          }
        }}
        onClick={() => {
             if (upgrade) return;

          if (!from && chance) {
           setMoves(chess.moves({square : squareRepresentation, verbose : true}));

            setFrom(squareRepresentation);

          } else if (from && chance) {
            handleMove(from, squareRepresentation,square);
          }
        }}
      >
        <div className="w-full h-full flex justify-center items-center">
            {moves?.some((move : any)  => move.to === squareRepresentation) && (
  <div className="absolute">
    <div className="bg-yellow-500 rounded-full w-5 h-5"></div>
  </div>
)}

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
          ) 
       : null}
        </div>
      </div>    
    );
  };

  if (winner) {
  return  (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 text-white">
      <div className="bg-slate-800 p-6 rounded-xl text-xl font-bold">
        {winner === side ? "your loosed  " : "you won the match 🏆  "}
      </div>
    </div>
  );
}
  // White side
  if (side === "w") {
    return (
      <div className="text-white-200">
   {upgrade && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg">
      <h2 className="mb-2">Choose Promotion</h2>
      <div className="flex gap-2">
        {["q", "r", "b", "n"].map((piece) => (
          <button
            key={piece}
            onClick={() => {
              setPawn(piece as PieceSymbol);
              doPromote(piece as PieceSymbol);
             
            }}
            className="p-2 border rounded hover:bg-gray-200"
          >
            {piece.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  </div>
)}

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


        {upgrade && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-4 rounded-lg">
      <h2 className="mb-2">Choose Promotion</h2>
      <div className="flex gap-2">
        {["q", "r", "b", "n"].map((piece) => (
          <button
            key={piece}
            onClick={() => {
              //setPawn(piece as PieceSymbol);
              doPromote (piece as PieceSymbol);
            }}
            className="p-2 border rounded hover:bg-gray-200"
          >
            {piece.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  </div>
)}



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

import { Board } from '../types';

interface BoardHeaderProps {
  board: Board;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <header
      className={`flex items-end p-2 text-white ${board.background}`}
    >
      <div className="w-full">
        <h1 className="text-lg font-bold mb-1 text-white">{board.title}</h1>
      </div>
    </header>
  );
}

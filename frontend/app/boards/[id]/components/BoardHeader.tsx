import { Board } from '../types';

interface BoardHeaderProps {
  board: Board;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <header
      className={`relative flex items-end p-4 text-white`}
    >
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-1 text-white">{board.title}</h1>
      </div>
    </header>
  );
}

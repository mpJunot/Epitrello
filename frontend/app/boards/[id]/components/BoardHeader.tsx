import { Board } from '../types';

interface BoardHeaderProps {
  board: Board;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <header
      className={`relative h-32 ${board.background || 'bg-gray-300'} flex items-end p-6 text-white`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-20" />
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-1">{board.title}</h1>
        {board.description && (
          <p className="text-white text-opacity-90">{board.description}</p>
        )}
      </div>
    </header>
  );
}

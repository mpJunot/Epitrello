import { Board } from '../types';

interface BoardHeaderProps {
  board: Board;
}

export function BoardHeader({ board }: BoardHeaderProps) {
  return (
    <header
      className={`relative h-32 ${board.background || 'bg-trello-blue'} flex items-end p-6 text-white`}
    >
      <div className="absolute inset-0 bg-black bg-opacity-10" />
      <div className="relative z-10">
        <h1 className="text-2xl font-bold mb-1 text-white">{board.title}</h1>
        {board.description && (
          <p className="text-white/90">{board.description}</p>
        )}
      </div>
    </header>
  );
}

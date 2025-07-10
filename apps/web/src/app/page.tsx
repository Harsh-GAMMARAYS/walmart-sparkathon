'use client';

import { Navbar } from '@/components/Navbar';
import { ProductTile } from '@/components/ProductTile';
import { ChatWidget } from '@/components/ChatWidget';

const tiles = [
  {
    title: 'Save on premium haircare like Redken',
    bgColor: 'bg-[#F0F4FE]',
    className: 'col-span-1 row-span-2',
  },
  {
    title: 'Lilo & Stitch toys & more',
    bgColor: 'bg-[#E6F6FF]',
    className: 'col-span-1',
  },
  {
    title: 'Save big on hundreds of pet picks!',
    bgColor: 'bg-[#F0F4FE]',
    className: 'col-span-1',
  },
  {
    title: "Premium beauty. Victoria's Secret.",
    bgColor: 'bg-[#FFF6F0]',
    className: 'col-span-1',
  },
  {
    title: 'Up to 65% off',
    bgColor: 'bg-[#FFF9E6]',
    className: 'col-span-1',
  },
];

const rightTiles = [
  {
    title: 'Summer home trends from $6',
    bgColor: 'bg-[#F0F4FE]',
    className: 'mb-6',
  },
  {
    title: 'New Jurassic World movie, 7/2',
    bgColor: 'bg-[#E6F6FF]',
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-white min-h-screen px-6 py-8">
        <div className="grid grid-cols-4 gap-6">
          <ProductTile {...tiles[0]} />
          <div className="col-span-2 row-span-2 bg-[#FFF6F0] rounded-xl p-6 flex flex-col justify-between">
            <div className="bg-white rounded-lg h-32 mb-4"></div>
            <div className="text-3xl font-extrabold text-[#222] mb-2">Suncare is self-care</div>
            <a href="#" className="inline-block bg-white text-[#222] font-semibold rounded-full px-4 py-2 shadow hover:bg-gray-100 mb-4">Shop now</a>
            <div className="text-lg font-bold text-[#222]">From $11</div>
          </div>
          {tiles.slice(1).map((tile, idx) => (
            <ProductTile key={tile.title} {...tile} />
          ))}
          <div className="col-span-1 row-span-2 flex flex-col gap-6">
            {rightTiles.map((tile, idx) => (
              <ProductTile key={tile.title} {...tile} />
            ))}
          </div>
        </div>
      </main>
      <ChatWidget />
    </>
  );
}

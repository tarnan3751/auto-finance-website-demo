import React from 'react';

type Props = { rank:number; title:string; summary:string; image:string; url:string; };
export default function ArticleCard({ rank,title,summary,image,url }:Props) {
  return (
    <div className="flex gap-4 p-4 border rounded-xl shadow-md">
      <img src={image} alt={title} className="w-24 h-24 rounded-md object-cover" />
      <div>
        <h2 className="text-xl font-bold">#{rank} <a href={url} className="text-blue-600 underline">{title}</a></h2>
        <p className="text-gray-600 mt-1">{summary}</p>
      </div>
    </div>
  );
}
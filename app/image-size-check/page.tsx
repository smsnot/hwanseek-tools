import type {Metadata} from 'next';
import Review from './review';
export const metadata:Metadata={title:'Image Size Check — HWANSEEK',description:'Convert a still image to JPG under your chosen byte and width limits. Compare the actual result, read exact file size, and download a copy.'};
export default function Page(){return <Review/>;}

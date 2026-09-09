import type {Metadata} from 'next';
import Review from './review';
export const metadata:Metadata={title:'Image Fit Review — HWANSEEK',description:'Fit a batch of photos inside one canvas size without cropping. Preview padding, preserve aspect ratio, and download PNG copies in a ZIP.'};
export default function Page(){return <Review/>;}

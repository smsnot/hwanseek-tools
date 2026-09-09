import type {Metadata} from 'next';
import Review from './review';
export const metadata:Metadata={title:'Photo Sheet — HWANSEEK',description:'Create a PDF overview of your photos with readable, selectable filenames. Arrange images, choose A4 or Letter, preview, and download a copy.'};
export default function Page(){return <Review/>;}

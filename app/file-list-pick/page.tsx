import type {Metadata} from 'next';
import Review from './review';
export const metadata:Metadata={title:'File List Pick — HWANSEEK',description:'Paste a filename list, review missing and ambiguous matches, and download selected local files in a ZIP with their folder paths.'};
export default function Page(){return <Review/>;}

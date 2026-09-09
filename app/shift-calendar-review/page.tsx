import type {Metadata} from 'next';
import Review from './review';
export const metadata:Metadata={title:'Shift Calendar Review — HWANSEEK',description:'Turn a copied monthly work schedule row into an ICS calendar file. Review each date, preserve empty cells, resolve unknown codes, and check overnight shifts before export.'};
export default function Page(){return <Review/>;}

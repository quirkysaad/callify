export type CallTypes = 'INCOMING' | 'OUTGOING' | 'MISSED' | 'REJECTED' | 'UNKNOWN';

export type CallLogProps = {
    id: string;
    date: number;
    duration: number; // in seconds
    name?: string;
    number: string;
    type: CallTypes;
}

export type CallSectionProps = {
  title: string;  
  data: CallLogProps[];
}
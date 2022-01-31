import { Bottle } from ".";

export type BottleEditableDetails = Omit<Bottle, 'owner' | 'totalSupply'>;

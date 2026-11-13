import { ModuleParser } from '../src/lang/module-parser';
import { LocalKinds } from '../src/canon/local-catalog';
import { Canon } from '../src/canon/canon';
import { ItemCatalog } from '../src/item-catalog';
console.log('dagger before',!!Canon.items.dagger,!!ItemCatalog.definitions.dagger);
try {ModuleParser.parse('Module bad "Bad" { Kind dagger "a counterfeit" is treasure worth 9. }');}
catch(e){console.log('expected rejection',String(e));}
LocalKinds.reset();
console.log('dagger after reset',!!Canon.items.dagger,!!ItemCatalog.definitions.dagger);

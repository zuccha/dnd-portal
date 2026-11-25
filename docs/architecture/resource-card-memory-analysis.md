# Analisi memoria della vista carte

## Scopo e ambito

Questo documento valuta i dati e gli hook usati dall'album di carte, prendendo gli incantesimi del bundle SRD24 come campione. Esclude DOM, alberi React/Fiber, layout, immagini decodificate, rasterizzazione e memoria GPU. Le stime descrivono quindi il costo dei dati e delle strutture JavaScript, non l'intero processo del browser.

Le misure di heap sono state raccolte con Node e servono come ordine di grandezza. L'implementazione e il motore JavaScript del browser possono produrre valori diversi.

## Percorso dei dati

1. Il catalogo conserva le risorse per fonte in mappe e mantiene una vista attiva che punta agli stessi oggetti, senza copiarli integralmente. Il bundle persistito in IndexedDB non equivale a un'altra copia JSON permanentemente presente nell'heap.
2. `ResourcesAlbum` ricava gli ID filtrati e una lista condivisa di riferimenti alle risorse attive. La lista degli ID copre tutte le spell visibili secondo i filtri; i placeholder delle carte non costruiscono la carta localizzata.
3. L'album virtualizza le carte: il contenuto attivo e limitato alle righe visibili e a due righe di overscan per lato. Gli altri elementi restano placeholder.
4. Ogni carta attiva legge la risorsa raw, ne crea la localizzazione e, per le spell, risolve le classi correlate.
5. Ogni `ResourcePokerCard` costruisce i pattern rich text. Il pattern dei link contiene una lookup delle risorse attive per kind e ID.

Riferimenti principali: `resources-album.tsx`, `resource-card-interactive.tsx`, `resource-poker-card.tsx`, `resource-link-pattern.tsx`, `resource-store.ts`, `localized-spell.ts` e `catalogue.ts`.

## Misure sul bundle SRD24

| Quantita                                                  |         Misura |
| --------------------------------------------------------- | -------------: |
| Bundle JSON su disco                                      |       4,55 MiB |
| Bundle parsato, incremento heap rispetto al baseline Node |       4,72 MiB |
| Risorse totali                                            |          1.819 |
| Incantesimi                                               |            339 |
| JSON serializzato delle spell                             |       0,72 MiB |
| Copia parsata delle spell, incremento heap Node           |       2,34 MiB |
| Costo medio della copia raw di una spell                  |        7,1 KiB |
| Caratteri medi della descrizione raw                      | 813 IT, 673 EN |
| Relazioni classe-incantesimo                              |            881 |

Il bundle completo in memoria e condiviso dal catalogo; non va moltiplicato per il numero di carte. Le risorse di fonti diverse possono invece restare residenti nelle rispettive mappe del catalogo. In presenza di fonti sovrapposte, gli oggetti delle fonti continuano a esistere anche se solo una versione e risolta nella vista attiva.

## Stima delle strutture per carta attiva

### Indice dei link

La modifica corrente in `createResourceLinkPattern` crea un oggetto annidato `Record<kind, Record<id, Resource>>`. In questo modo la ricerca del link diventa un accesso diretto invece della scansione lineare dell'array, ma l'indice viene costruito da capo ogni volta che viene creato il pattern.

Un benchmark Node con le 1.819 risorse SRD ha misurato circa **98,5 KiB per indice**. Le voci contengono riferimenti alle risorse esistenti, non copie delle risorse; il costo e principalmente quello del contenitore e delle chiavi.

| Indici simultaneamente vivi | Costo stimato |
| --------------------------: | ------------: |
|                    15 carte |      1,44 MiB |
|                    25 carte |      2,40 MiB |
|                   300 carte |      28,9 MiB |
|                   339 carte |      32,6 MiB |

Il calcolo per 300 carte conferma che la duplicazione puo raggiungere circa 30 MiB. La virtualizzazione riduce il numero di carte montate contemporaneamente, ma non elimina la costruzione ripetuta quando si scorrono nuove carte.

Inoltre, nel bundle SRD attuale solo **10 spell su 339** contengono almeno un link risorsa nei campi descrizione o potenziamento, considerando entrambe le lingue. Le altre carte costruiscono comunque l'indice anche se non possono usarlo.

### Relazioni e localizzazione

Ogni carta localizzata di una spell sottoscrive il gruppo di relazioni `character_classes_and_spells`. La lista contiene 881 righe condivise come oggetti; ogni hook conserva pero un proprio array di riferimenti. La copia superficiale misurata costa circa **6,9 KiB per carta**: circa 0,10 MiB per 15 carte, 0,17 MiB per 25 e 2,3 MiB nel caso limite di tutte le 339.

Per individuare le classi di una spell, il codice scandisce il gruppo di relazioni e ricava mediamente 2,6 righe per spell. La localizzazione costruisce inoltre piccoli array e oggetti per classi, abbreviazioni e link. Sono costi secondari rispetto all'indice dei link, ma ripetuti per ogni carta attiva.

La risorsa localizzata ha nome, descriptor, descrizione e campi specifici. La descrizione raw media selezionata per la lingua e nell'ordine di 0,7-0,8 mila caratteri. L'output formattato, i campi classe e i buffer testuali della paginazione aggiungono verosimilmente **pochi KiB per carta**. Sono stime meno precise: le stringhe possono condividere il backing storage oppure essere ricreate da `translate`, `formatDescription` e dalla paginazione.

### Totale indicativo

Per una carta attiva, l'ordine di grandezza dei dati derivati e circa **0,11 MiB**, dominato dall'indice dei link. Quindi 15-25 carte attive portano a circa **1,6-2,8 MiB**; 339 carte simultaneamente montate sarebbero nell'ordine di **36-38 MiB**. Non sono inclusi dati del renderer.

Questa stima non spiega picchi di centinaia di MiB o oltre 1 GiB. Quelli richiedono di indagare separatamente memoria di rendering, rasterizzazione, allocazioni transitorie o altri sottosistemi.

## Opportunita di ottimizzazione

### 1. Condividere l'indice dei link

La mappa per kind e ID e utile per evitare una scansione `O(n)` a ogni link. Il punto subottimale e la sua ownership: oggi l'indice e creato dentro `createResourceLinkPattern`, quindi ogni carta conserva una copia equivalente.

La direzione da valutare e costruire l'indice una volta per la lista di riferimenti attivi e condividerlo tra le carte. La cache dovrebbe dipendere dall'identita/versione della lista attiva; un cambio di fonte o un aggiornamento delle risorse deve produrre un indice coerente con il nuovo insieme. Non occorre introdurre un React context: l'album puo possedere e passare il dato, oppure una factory/utility puo fornire una cache esplicita.

Come ulteriore ottimizzazione, si puo evitare del tutto di creare il pattern per descrizioni che non contengono link. Nel bundle attuale questo eviterebbe l'indice a 329 carte su 339; la condivisione rimane comunque preferibile per le carte che hanno link.

### 2. Ridurre il lavoro sulle relazioni

Le 881 relazioni vengono rese disponibili a ogni hook di localizzazione e scandite per ottenere le poche classi della spell. Una soluzione possibile e un selettore generico indicizzato per endpoint, condiviso per snapshot di relazioni attive, cosi da evitare array e scansioni completi per ogni carta. Va mantenuta la reattivita alle modifiche e alle relazioni draft.

L'impatto atteso e piu rilevante per allocazioni, scansioni e sottoscrizioni che per MiB. Per ora e ragionevole considerarlo secondario rispetto all'indice dei link.

### 3. Rappresentazione delle classi localizzate

`LocalizedSpell` contiene sia `character_classes`, una lista strutturata di link con nome e abbreviazione, sia `character_class_abbreviations`, una stringa concatenata derivata dalla stessa informazione. La carta usa la stringa quando i link sono disattivati e la lista quando i link sono attivi.

La soluzione piu lineare e mantenere la lista strutturata come fonte unica e derivare la stringa nella carta, eventualmente tramite una funzione formatter condivisa. Nome, kind, ID e abbreviazione rimangono disponibili e non si conserva anche la concatenazione duplicata. Il risparmio e piccolo; il beneficio principale e avere una sola rappresentazione canonica.

### 4. Evitare la doppia lettura della risorsa

Il wrapper della carta chiama `useResource(resourceId)` e poi `useLocalizedResource(resourceId)`, che internamente legge di nuovo la stessa risorsa. Entrambe le letture sono necessarie semanticamente: la carta usa il dato raw per azioni e operazioni sul catalogo e il dato localizzato per la visualizzazione. Non vengono create due copie della risorsa, ma ci sono due hook/sottoscrizioni allo stesso ID.

La soluzione consigliata e aggiungere allo store un hook generico, ad esempio `useResourceAndLocalizedResource(resourceId)`, che effettui una sola lettura reattiva e restituisca `{ resource, localizedResource }` (oppure `undefined` quando l'ID non e presente). Lo store deve continuare a possedere la logica di localizzazione, incluse le relazioni; la carta non dovrebbe ricostruirla. L'hook corrente `useLocalizedResource` puo restare invariato per gli altri consumatori.

## Decisioni ancora aperte

- Se condividere la mappa attraverso props dell'album o tramite una cache/utility con invalidazione esplicita.
- Se costruire il pattern solo per testi che contengono link, oppure sempre una volta per insieme di risorse.
- Se introdurre il selettore indicizzato delle relazioni ora o rimandarlo, dato il suo impatto di memoria contenuto.
- Se applicare l'hook combinato raw/localized a tutte le carte o solo dove il componente consuma entrambi i valori.

Questo documento registra analisi e proposte; non approva automaticamente nessuno dei refactoring elencati.

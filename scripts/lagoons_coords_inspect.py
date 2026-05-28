import json, collections

d = json.load(open('server/data/lagoons.json'))
villas = d['villas']
sample = villas[0]
print('all keys for sample:')
for k in sample.keys():
    print(' ', k, '=', repr(sample[k])[:80])

# Detect coordinate-ish fields
candidates = [k for k in sample.keys() if any(t in k.lower() for t in ['lat','lng','lon','coord','google','map','pin'])]
print('\ncoord-ish keys:', candidates)

# Group unique coords per cluster
groups = collections.defaultdict(set)
for v in villas:
    cluster = v.get('cluster')
    for ck in candidates:
        groups[(cluster, ck)].add(json.dumps(v.get(ck)))

for (cluster, ck), vals in sorted(groups.items()):
    print(f'cluster={cluster} field={ck} unique_vals={len(vals)}')
    for val in list(vals)[:3]:
        print('   ', val[:140])

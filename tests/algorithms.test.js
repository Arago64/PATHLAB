import test from 'node:test';
import assert from 'node:assert/strict';
import { generateGraph, euclidean, findEdge } from '../src/graph.js';
import { solve, ALGORITHMS } from '../src/algorithms.js';

function exampleGraph(nodes, pairs) {
  const graphNodes=nodes.map(([x,y],id)=>({id,x,y}));
  const adj=Array.from({length:graphNodes.length},()=>[]);
  const edges=pairs.map(([u,v],id)=>({id,u,v,w:euclidean(graphNodes[u],graphNodes[v])}));
  for(const {id,u,v,w} of edges){adj[u].push({to:v,edgeId:id,w});adj[v].push({to:u,edgeId:id,w});}
  return {nodes:graphNodes,adj,edges};
}

test('graph generation is deterministic and connected',()=>{
  for(const count of [40,85,180]) for(const neighbors of [1,3,6]){
    const one=generateGraph({count,neighbors,seed:32001});
    const two=generateGraph({count,neighbors,seed:32001});
    assert.deepEqual(one,two);
    assert.equal(one.nodes.length,count);
    const seen=new Set([0]),queue=[0];
    for(let i=0;i<queue.length;i++) for(const edge of one.adj[queue[i]]) if(!seen.has(edge.to)){seen.add(edge.to);queue.push(edge.to);}
    assert.equal(seen.size,count);
    for(const edge of one.edges){assert.ok(edge.w>0);assert.equal(findEdge(one,edge.u,edge.v),edge.id);}
  }
});

test('A* and Dijkstra agree for many seeds and endpoints',()=>{
  for(let seed=1;seed<=24;seed++){
    const g=generateGraph({count:70+(seed%7)*10,neighbors:1+seed%6,seed});
    for(const [a,b] of [[g.start,g.goal],[0,g.nodes.length-1]]){
      const d=solve(g,a,b,'dijkstra'), astar=solve(g,a,b,'astar');
      assert.equal(d.found,true);assert.equal(astar.found,true);
      assert.ok(Math.abs(d.distance-astar.distance)<1e-7);
      assert.equal(d.path[0],a);assert.equal(d.path.at(-1),b);
    }
  }
});

test('BFS minimizes hops but does not necessarily minimize distance',()=>{
  const g=exampleGraph([[0,0],[0,100],[4,0],[16,0],[12,0]],[[0,1],[1,3],[0,2],[2,4],[4,3]]);
  const bfs=solve(g,0,3,'bfs');
  const d=solve(g,0,3,'dijkstra');
  assert.equal(bfs.hops,2);assert.deepEqual(bfs.path,[0,1,3]);
  assert.equal(d.hops,3);assert.deepEqual(d.path,[0,2,4,3]);
  assert.ok(bfs.distance>d.distance*10);
});

test('custom methods deliberately expose local dead ends',()=>{
  const g=exampleGraph([[0,0],[8,0],[6,7],[20,0],[5,18]],[[0,1],[0,2],[2,4],[4,3]]);
  assert.equal(solve(g,0,3,'dijkstra').found,true);
  assert.equal(solve(g,0,3,'vector').found,false);
  assert.equal(solve(g,0,3,'course').found,false);
});

test('every reported route uses real edges and sums real distances',()=>{
  for(let seed=30;seed<45;seed++){
    const g=generateGraph({count:60,neighbors:2,seed});
    for(const {id} of ALGORITHMS){
      const result=solve(g,g.start,g.goal,id,{record:true});
      assert.ok(Array.isArray(result.trace));
      assert.ok(result.visited<=g.nodes.length);
      assert.ok(result.checks>=0);
      if(!result.found){assert.equal(result.distance,Infinity);continue;}
      let dist=0;
      for(let i=1;i<result.path.length;i++){
        assert.notEqual(findEdge(g,result.path[i-1],result.path[i]),-1);
        dist+=euclidean(g.nodes[result.path[i-1]],g.nodes[result.path[i]]);
      }
      assert.ok(Math.abs(dist-result.distance)<1e-8);
    }
  }
});

test('equal endpoints and unreachable graphs are handled',()=>{
  const g=exampleGraph([[0,0],[10,0],[20,0]],[[0,1]]);
  for(const {id} of ALGORITHMS){
    const same=solve(g,1,1,id);
    assert.equal(same.found,true);assert.equal(same.distance,0);
    const unreachable=solve(g,0,2,id);
    assert.equal(unreachable.found,false);
  }
});

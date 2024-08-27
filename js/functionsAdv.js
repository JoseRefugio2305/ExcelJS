const Tree = {}//Arbol
const arr_tree = [0,2,1,-1,-2,-2.5,-1.5, -0.5,0.5,1.5,2.5]//Arreglo

Tree[arr_tree[0]] = {}//Primer elemento raiz del arbol
const treefun = (root, actual) =>{
     const treeNode = Tree[root]
     let is_aNode =""

     if(actual<root){
          is_aNode ='left'
     }else if(actual>root){
          is_aNode = 'right'
     }

     if (is_aNode !== '') {
          if (!(is_aNode in treeNode)) {
            treeNode[is_aNode] = actual;
            Tree[actual] = {};
          } else {
            treefun(treeNode[is_aNode], actual);
          }
     }
} 

const call_tree =(event)=>{
     
     for(let i=1; i<arr_tree.length; i++){
          // console.log(Tree)
          treefun(arr_tree[0], arr_tree[i])
          console.log(Tree)
     }
}


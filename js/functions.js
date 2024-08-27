const funciones = { //Expresiones regulares para identificar las formulas introducidas en las celdas
     "text": {
          "regex":"[A-Za-z0-9]"
     },
     "basic1":{
          "regex":"=[A-Z]?[0-9]+"
     },
     "basic2":{
          "regex":"=[0-9]+.[0-9]+"
     },
     "basic3":{
          "regex":"=[A-Z]?[0-9]+([+--*/][A-Z]?[0-9]+)?"
     },
     "basic4":{
          "regex":"=[A-Z]?[0-9]+([+--/*]?[A-Z]?[0-9]+)*"
     },
     "basic5":{
          "regex":"=(([(]?[A-Z]?[0-9]+(.[0-9]+)?[+-/*]?([A-Z]?[0-9]+(.[0-9]+)?)?[)]?)[+-/*]?)+"
     }
}

let cellMeta = [] //Aqui guardaremos informacion de las celdas, como las formulas que tienen intriducidas, el resultado de dicha formula y que otras celdas hacen referencia a ella
     //{ "idcell":{
     //      "operadores":[],
     //      "operandos":[],
     //      "resultado":XX,
     //      "formula":""
     //      "cellref":[]//celdas que hacen referencia a esta celda
     // }}

let regex = null //new RegExp()

const referencias = ()=>{
     console.log(cellMeta)
}

const showForm = (event) =>{ 

     let isExistsIdx = cellMeta.findIndex((x)=>x.idCell==event.id)
     if(isExistsIdx!=-1)
     {
          if(cellMeta[isExistsIdx].formula!=""){
               event.value = cellMeta[isExistsIdx].formula
          }
          
     }

     //Con esta funcion hacemos que el encabezado de columna y fila se marquen
     indicarCR(event.id,0)
}

const indicarCR = (idCell, option) =>{//option 0 es para activar y 1 para desactivar
     let col = idCell.split(/[0-9]+/).filter(c=>c!="")
     let reng = idCell.split(/[A-Z]+/).filter(r=>r!="")
     if(option==0){
          document.getElementById("cell_"+col).setAttribute("class", 'enc_sel tr_enc_lat')
          document.getElementById("cell_"+reng).setAttribute("class", 'enc_sel tr_enc_lat')
     }
     else{
          document.getElementById("cell_"+col).removeAttribute("class", 'enc_sel')
          document.getElementById("cell_"+reng).removeAttribute("class", 'enc_sel')
          document.getElementById("cell_"+col).setAttribute("class", 'encabezado tr_enc_lat')
          document.getElementById("cell_"+reng).setAttribute("class", 'encabezado tr_enc_lat')
     }
}

const evalFun = (event)=>{
     let valin = event.value.trim()
     if(new RegExp(funciones['basic3']['regex']).test(valin) || new RegExp(funciones['basic2']['regex']).test(valin))//Revisamos si es una formula basica
     {

          let ops = getOps(event.id, valin)
          if(!ops[0])
          {
               return false
          }
          // doOperation(event.id, operadores, operandos, valin)
          doOperation(event.id, ops[0], ops[1], valin)
     }
     else if(new RegExp(funciones['basic5']['regex']).test(valin))
     {
          let cad_num = ""
          let arr_expr = []
          let arr_op = Array.from(valin.substr(1))

          for(let x=0; x<arr_op.length; x++)
          {
               if(new RegExp(/[+-/*^()]/).test(arr_op[x]) && arr_op[x]!='.')
               {
                    if(cad_num.length>0)
                    {
                         arr_expr.push(cad_num)
                         cad_num=""
                    }
                    arr_expr.push(arr_op[x])
               }
               else if(new RegExp(/[0-9]|[A-Z]|./).test(arr_op[x]))
               {
                    cad_num+=arr_op[x]
                    if(x==arr_op.length-1)
                    {
                         arr_expr.push(cad_num)
                    }
               }
          }
          
          let ops = getOps(event.id, valin)
          if(!ops[0])
          {
               return false
          }

          doInfijo(event.id, arr_expr, valin, ops[0], ops[1])
     }
     else if(new RegExp(funciones['text']['regex']).test(valin) || valin==='')//Revisamos si es solo texto o un numero o esta vacio
     {
          let isExistsIdx = cellMeta.findIndex((x)=>x.idCell==event.id)
          if(isExistsIdx==-1)
          {
               cellMeta.push({
                    "idCell":event.id,
                    "operandos":[],
                    "operadores":[],
                    "formula":"",
                    "resultado":0,
                    "cellref":[]
               })
          }
          else
          {
               delRef(event.id)
               cellMeta[isExistsIdx]={
                    "idCell":event.id,
                    "operandos":[],
                    "operadores":[],
                    "formula":"",
                    "resultado":0,
                    "cellref":cellMeta[isExistsIdx].cellref
               }
          }
     }

     actValRef(event.id)
     indicarCR(event.id,1)
}

const getOps = (idCell, value) =>{
     let val = value.substr(1)//quitamos el igual = de la entrada de texto
     let operadores = val.split(/[A-Z]?[0-9]+/)//hacemos un split para tomar solo los operadores de la formula
     let operandos = val.split(/[+--*/()]/)//tomamos solo los operandos

     //revisams si esta haciendo referencia a la misma celda, ya que esto no es posible
     let refsm = operandos.find((x)=>x==idCell)
     if(refsm)
     {
          confirm("Una celda no pued hacer referencia a si misma")
          return [false, false]
     }

     operadores = operadores.filter((op)=>op!="" && op!=".")

     return [operadores, operandos]
}

const doOperation = (idCell, operadores, operandos, formula) => {
     let isExistsIdx = cellMeta.findIndex((x)=>x.idCell==idCell)
     if(isExistsIdx==-1)
     {
          cellMeta.push({
               idCell,
               operandos,
               operadores,
               formula,
               "resultado":0,
               "cellref":[]
          })
     }
     else
     {
          cellMeta[isExistsIdx]={
               idCell,
               operandos,
               operadores,
               formula,
               "resultado":cellMeta[isExistsIdx].resultado,
               "cellref":cellMeta[isExistsIdx].cellref
          }
     }
     
     isExistsIdx = cellMeta.findIndex((x)=>x.idCell==idCell)

     //obtenemos los valores reales en caso de que se haga referencia a una celda
     let valores = []

     for(let i=0; i<operandos.length; i++)
     {
          if(new RegExp(/[A-Z][0-9]+/).test(operandos[i]))//referencia a celda
          {
               let valcel = document.getElementById(operandos[i])
               try {
                    valores.push(parseFloat(valcel.value ? valcel.value : 0))
               } catch (error) {
                    valores.push(valcel)
               }
               //Hacemos que ahora la celda a la que hacemos referencia guarde en su informacion que celda hace referencia a ella
               let isEIdx = cellMeta.findIndex((x)=>x.idCell==operandos[i])
               if(isEIdx==-1)
               {
                    cellMeta.push({
                         "idCell":operandos[i],
                         "operandos":[],
                         "operadores":[],
                         "formula":"",
                         "resultado":0,
                         "cellref":[idCell]
                    })
               }
               else
               {
                    let isEIdxRef = cellMeta[isEIdx].cellref.findIndex((y)=>y==idCell)//Esta evaluacion es para que el arreglo de referencias no repita celdas
                    if(isEIdxRef==-1)
                    {
                         cellMeta[isEIdx].cellref.push(idCell)
                    }
                    
               }
          }
          else
          {
               valores.push(parseFloat(operandos[i]))
          }
     }

     let celform = document.getElementById(idCell)

     if(operadores[0]=="+")
     {
          celform.value = valores[0]+valores[1]
     }
     else if(operadores[0]=="-")
     {
          celform.value = valores[0]-valores[1]
     }
     else if(operadores[0]=="*")
     {
          celform.value = valores[0]*valores[1]
     }
     else if(operadores[0]=="/")
     {
          celform.value = valores[0]/valores[1]
     }
     else if(operadores.length==0)
     {
          celform.value = valores[0]
     }

     cellMeta[isExistsIdx].resultado = celform.value

     
}

const actValRef = (idCell)=>{//Funcion para que cuando una celda cambie de valor se actualice su valor en las celdas que hacen referencia a ella
     let isEIdx = cellMeta.findIndex((x)=>x.idCell==idCell)
     if(isEIdx!=-1)
     {

          cellMeta[isEIdx].cellref.forEach(cell => {
               let input = document.getElementById(cell)
               let Idx = cellMeta.findIndex((z)=>z.idCell==cell)
               input.value = cellMeta[Idx].formula
               evalFun(input)
          });

     }
}

const delRef = (idCell) =>{//Con esta funcion haremos que cuando una formula sea borrada en una celda, actualizaremos los arreglos de referencias de las celdas a las que hacia referencia dicha formula
     let isEIdx = cellMeta.findIndex((x)=>x.idCell==idCell)
     if(isEIdx!=-1)
     {

          cellMeta[isEIdx].operandos.forEach(cell => {
               if(new RegExp(/[A-Z][0-9]+/).test(cell))//Revisamos que el operando sea una celda
               {
                    let Idx = cellMeta.findIndex((x)=>x.idCell==cell)
                    if(Idx!=-1)
                    {
                         cellMeta[Idx].cellref = cellMeta[Idx].cellref.filter(x=> x!=idCell)
                    }
               }
          });

     }
}


const ops_jerarq = {
     "^":{
          "p":3
     },
     "*":{
          "p":2
     },
     "/":{
          "p":2
     },
     "+":{
          "p":1
     },
     "-":{
          "p":1
     }
}

const doInfijo = (idCell, arrExp, formula, operadores, operandos) => {
     // let arreglo = [3,"/",5,'*','(',1,'+',2,'-',5,')','^',2,'^',2,'-',2,'*',3]
     // let arreglo = [3,"+",4,'*',2,'/','(',1,'-',5,')','^',2,'^',3]
     // let arreglo = [3,"+",4,'*',2,'/',3]
     // let arreglo = [5,"+",3,'*','(','(',3,'+',5,')','*','(',1,'-',7,')',')','/',5]
     // let arreglo = [5,"+",3,'*',5]
     let isExistsIdx = cellMeta.findIndex((x)=>x.idCell==idCell)
     if(isExistsIdx==-1)
     {
          cellMeta.push({
               idCell,
               operandos,
               operadores,
               formula,
               "resultado":0,
               "cellref":[]
          })
     }
     else
     {
          cellMeta[isExistsIdx]={
               idCell,
               operandos,
               operadores,
               formula,
               "resultado":cellMeta[isExistsIdx].resultado,
               "cellref":cellMeta[isExistsIdx].cellref
          }
     }

     let arreglo = arrExp
     // let arreglo = ['(','(',5,'+',3,'*',5,')','^',2,')','^',3,'-',2]

     for(let z=0; z<arreglo.length; z++)
     {
          if(new RegExp(/[A-Z][0-9]+/).test(arreglo[z]))//referencia a celda
          {
               let valcel = document.getElementById(arreglo[z])
               try {
                    arreglo[z] = parseFloat(valcel.value ? valcel.value : 0)
               } catch (error) {
                    arreglo[z] = valcel
               }
               
               //Hacemos que ahora la celda a la que hacemos referencia guarde en su informacion que celda hace referencia a ella
               let isEIdx = cellMeta.findIndex((x)=>x.idCell==valcel.id)
               if(isEIdx==-1)
               {
                    cellMeta.push({
                         "idCell":valcel.id,
                         "operandos":[],
                         "operadores":[],
                         "formula":"",
                         "resultado":0,
                         "cellref":[idCell]
                    })
               }
               else
               {
                    let isEIdxRef = cellMeta[isEIdx].cellref.findIndex((y)=>y==idCell)//Esta evaluacion es para que el arreglo de referencias no repita celdas
                    if(isEIdxRef==-1)
                    {
                         cellMeta[isEIdx].cellref.push(idCell)
                    }
                    
               }
          }
          else if(new RegExp(/[0-9]+(.[0-9]+)?/).test(arreglo[z]))
          {
               arreglo[z]=parseFloat(arreglo[z])
          }
     }
     let arr_ops =[]
     let arr_postfijo = []
     for(let i=0; i<arreglo.length; i++)
     {
          if(new RegExp(/[0-9]+([.][0-9]+)?/).test(arreglo[i]))//si es un numero
          {
               arr_postfijo.push(arreglo[i])
               
          }
          else if(new RegExp(/[+-/*^()]/).test(arreglo[i]))
          {
               if(arr_ops.length==0)
               {
                    arr_ops.push(arreglo[i])
               }
               else
               {
                    if(arreglo[i]=="(" || (arr_ops[0]=="(" && arreglo[i]!=")"))
                    {
                         arr_ops.unshift(arreglo[i])
                    }
                    else if(arreglo[i]==")")
                    {
                         for(let e=0; e<arr_ops.length; e++)
                         {
                              if(arr_ops[e]!="(")
                              {
                                   arr_postfijo.push(arr_ops[e])
                                   arr_ops.shift()
                                   e-=1

                              }
                              else
                              {
                                   arr_ops.shift()
                                   break
                              }
                         }
                    }
                    else if(ops_jerarq[arreglo[i]]?.p == ops_jerarq[arr_ops[0]]?.p && arreglo[i]!="^" && arr_ops[0]!="^")
                    {
                         arr_postfijo.push(arr_ops[0])
                         arr_ops.shift()
                         arr_ops.unshift(arreglo[i])
                    }
                    else if(ops_jerarq[arreglo[i]]?.p > ops_jerarq[arr_ops[0]]?.p)
                    {
                         arr_ops.unshift(arreglo[i])
                    }
                    else if(ops_jerarq[arreglo[i]]?.p < ops_jerarq[arr_ops[0]]?.p)
                    {
                         for(let d=0; d<arr_ops.length; d++)
                         {
                              if(ops_jerarq[arreglo[i]]?.p < ops_jerarq[arr_ops[0]]?.p)
                              {
                                   arr_postfijo.push(arr_ops[0])
                                   arr_ops.shift()
                                   d-=1
                              }
                              else
                              {
                                   
                                   break
                              }
                         }
                         arr_ops.unshift(arreglo[i])
                    }
                    else if(arreglo[i]=="^")
                    {
                         arr_ops.unshift(arreglo[i])
                    }
               }
          }
     }

     arr_postfijo = arr_postfijo.concat(arr_ops)
     doArbolExpr(idCell, arr_postfijo)
}

const doArbolExpr = (idCell, arr_postfijo) => {
     
     let arr_espera = []

     for(let i=0; i<arr_postfijo.length; i++)
     {
          if(new RegExp(/[+-/*^]/).test(arr_postfijo[i]) && !new RegExp(/[0-9]+([.][0-9]+)?/).test(arr_postfijo[i]))
          {
               let der = arr_espera.pop()
               let izq = arr_espera.pop()

               if(!der)
               {
                    der = {
                         "data":0
                    }
               }
               if(!izq)
               {
                    izq = {
                         "data":0
                    }
               }

               let nodo = {
                    "data":arr_postfijo[i],
                    "derecho":der,
                    "izquierdo":izq
               }

               arr_espera.push(nodo)
          }
          else
          {
               arr_espera.push({
                    "data":arr_postfijo[i]
               })
          }
     }

     let resultado = doOperationArExp(arr_espera[0])
     console.log(arr_espera[0])
     let isExistsIdx = cellMeta.findIndex((x)=>x.idCell==idCell)
     cellMeta[isExistsIdx].resultado = resultado
     console.log(resultado)
     document.getElementById(idCell).value = resultado?.data || resultado?.data==0 ? resultado?.data : "Error "

}

const doOperationArExp = (nodo) => {
     if (!nodo)
     {
          return
     }
     
     let izquierdo = doOperationArExp(nodo.izquierdo)
     let derecho = doOperationArExp(nodo.derecho)


     if(new RegExp(/[+-/*^()]/).test(nodo.data) && new RegExp(/[0-9]+([.][0-9]+)?/).test(izquierdo?.data) && new RegExp(/[0-9]+([.][0-9]+)?/).test(derecho?.data))
     {
          let data=null
          if(nodo.data=="+")
          {
               data = izquierdo?.data + derecho?.data
          }
          else if(nodo.data=="-")
          {
               data = izquierdo?.data - derecho?.data
          }
          else if(nodo.data=="*")
          {
               data = izquierdo?.data * derecho?.data
          }
          else if(nodo.data=="/")
          {
               data = izquierdo?.data / derecho?.data
          }
          else if(nodo.data=="^")
          {
               data = izquierdo?.data ** derecho?.data
          }

          return {
               "data":data
          }
     }
     else if(!nodo.derecho && !nodo.izquierdo)
     {
          return nodo
     }
}

window.addEventListener("load", ()=>{
     //Construimos la tabla de Excel

     let tabla = document.createElement("table")

     let abc = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

     //encabezado
     let enc = document.createElement('tr')
     enc.setAttribute('class', 'tr_enc')
     for(var i=0; i<=abc.length; i++)
     {
          let cel = document.createElement('td')
          cel.setAttribute('class','encabezado')
          if(i==0)
          {
               cel.innerHTML=" "
               cel.setAttribute('id', "cell_00")
          }
          else
          {
               cel.innerHTML=abc[i-1]
               cel.setAttribute('id', "cell_"+abc[i-1])
          }
          
          enc.appendChild(cel)
     }
     tabla.appendChild(enc)
     //demas renglones
     for(var r=0; r<100; r++)
     {
          let renglon = document.createElement("tr")
          
          for(var e=0; e<=abc.length; e++)
          {
               let cel = document.createElement('td')
               let html = ""
               if(e==0)
               {
                    cel.setAttribute('class', 'encabezado tr_enc_lat')
                    cel.innerHTML=r+1
                    cel.setAttribute('id', "cell_"+(r+1))
               }
               else
               {
                    cel.innerHTML=" "
                    cel.setAttribute('id', "cell_"+(abc[e-1])+(r+1))
                    // html = "<input type='text' id='"+abc[e-1]+(r+1)+"' onblur='evalFun(this)' onclick='showForm(this)'/>"
                    html = "<textarea name='' id='"+abc[e-1]+(r+1)+"' onblur='evalFun(this)' onclick='showForm(this)'></textarea>"
                    cel.innerHTML = html
               }
               
               renglon.appendChild(cel)
          }

          tabla.appendChild(renglon)
     }

     let dicmat = document.getElementById("matriz")
     dicmat.appendChild(tabla)
})



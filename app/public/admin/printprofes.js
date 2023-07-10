// api url
const api_url =
	"http://20.200.217.210:8000/profesores";

// Defining async function
async function getapi(url) {
	
	// Storing response
	const response = await fetch(url);
	
	// Storing data in form of JSON
	var data = await response.json();
	//onsole.log(data);
	if (response) {
	}
	show(data);
}
// Calling that async function
getapi(api_url);

// Function to define innerHTML for HTML table
function show(data) {
	let tab =
		`
        <thead class = "thead-dark">
        <tr>
		<th>Id</th>
		<th>Nombre</th>
		<th>Correo</th>
		<th>Status</th>
		<th>Eliminar</th>
		<th>Editar</th>
		<th>Informacion</th>
		</tr>
        </thead>
        `;
	
	// Loop to access all rows
    `<tbody>`
	let i = 0;
	for (let r of data) {
		if(r.isok > 0){
			r.isok = "Ok";
		}
		else{
			r.isok = "Pending";
		}
		tab += `<tr id="fila${i}">
	<td id="id${i}">${r.id}</td>
	<td id="nombre${i}">${r.nombre}</td>
	<td id="mail${i}">${r.mail}</td>
	<td>${r.isok}</td>
	<td><botton id = "${i}" onclick="myFunction(this)" class="btn btn-danger"> <i class="fa-solid fa-trash"></i> Eliminar </botton></td>
	<td><botton id = "${i}" onclick="editar(this)" class="btn btn-success"> <i class="fa-solid fa-pen"></i> Editar </botton></td>
	<td><botton id = "${i}" onclick="info(this)" class="btn btn-info"> <i class="fa-solid fa-circle-info"></i> Detalles </botton></td>
</tr>
</tbody>
`;
		i = i + 1;
	}
	// Setting innerHTML as tab variable
	document.getElementById("profes").innerHTML = tab;
}

function myFunction(element){
	var fila = document.getElementById(`fila${element.id}`)
	var id = document.getElementById(`id${element.id}`).innerHTML;
	//var id2 = $(`#id${element.id}`).val()

	console.log(parseInt(id));

	const data = {id: parseInt(id)};
    //console.log(data);
    fetch("http://20.200.217.210:8000/deleteProfesor",{
        method: 'POST',
        headers: {
            "Content-Type":"application/json"
        },
        body:  JSON.stringify(data)
    })
    .then(function(res) {
        return res.json();
    })     
    .then(function(data) { 
      if(data){
        alert("Profesor eliminado correctamente");
        window.location.href = "./profes.html";
      }
      else{
        alert("Error al procesar la informacion");
      }
    })
    .catch(function(err) {
        console.log("error");
    });
}
function editar(element){
	var id = document.getElementById(`id${element.id}`).innerHTML;
    window.localStorage.setItem('profe', id);
    window.location.href ="./editar_profesor.html";
    
}

function info(element){
	var id = document.getElementById(`id${element.id}`).innerHTML;
	var name = document.getElementById(`nombre${element.id}`).innerHTML;
	var mail = document.getElementById(`mail${element.id}`).innerHTML;
    localStorage.setItem('idProfe', id);
	localStorage.setItem('nameProfe', name);
	localStorage.setItem('mailProfe', mail);
	
    window.location.href ="./infoprofesor.html";
}
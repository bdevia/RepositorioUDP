// api url
const api_url =
	"http://20.200.217.210:8000/cursos";

// Defining async function
async function getapi(url) {
	
	// Storing response
	const response = await fetch(url);
	
	// Storing data in form of JSON
	var data = await response.json();
	//console.log(data);
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
		<th>Año</th>
		<th>Semestre</th>
		<th>Seccion</th>
        <th>Eliminar</th>
		<th>Editar</th>
		</tr>
        </thead>
        `;
	
	// Loop to access all rows
    `<tbody>`
	let i = 0;
	for (let r of data) {
		tab += `<tr id="fila${i}">
	<td id="id${i}">${r.id}</td>
	<td>${r.nombre} </td>
	<td>${r.año}</td>
	<td>${r.semestre}</td>
	<td>${r.seccion}</td>	
    <td><botton id = "${i}" onclick="myFunction(this, 'red')" class="btn btn-danger"> <i class="fa-solid fa-trash"></i> Eliminar </botton></td>
	<td><botton id = "${i}" onclick="editar(this, 'green')" class="btn btn-success"> <i class="fa-solid fa-pen"></i> Editar </botton></td>
</tr>
</tbody>
`;
	i = i + 1;
	}
	// Setting innerHTML as tab variable
	document.getElementById("cursos").innerHTML = tab;
}
function myFunction(element, color){
	element.style.color = color;
	//console.log(element.id)
	var fila = document.getElementById(`fila${element.id}`)
	var id = document.getElementById(`id${element.id}`).innerHTML;
	//var id2 = $(`#id${element.id}`).val()

	console.log(parseInt(id))

	const data = {id: parseInt(id)};
    //console.log(data);
    fetch("http://20.200.217.210:8000/deleteCurso",{
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
        alert("Curso eliminado correctamente");
        window.location.href = "./cursos.html";
      }
      else{
        alert("Error al procesar la informacion");
      }
    })
    .catch(function(err) {
        console.log("error");
    });

}

function editar(element, color){
	element.style.color = color;
	//console.log(element.id)
	var fila = document.getElementById(`fila${element.id}`)
	var id = document.getElementById(`id${element.id}`).innerHTML;
    window.localStorage.setItem('curso', id);
	//var id2 = $(`#id${element.id}`).val()
    window.location.href ="./editar_curso.html";
    
}

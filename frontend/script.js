const ul = document.querySelector('.left-list');
const getBtn = document.querySelector("#search-btn");
const getButton = document.querySelector("#get-students");
const input = document.querySelector("input");
const div = document.querySelector(".searchedStudent");
const url = "http://localhost:3000/studentsDetails";

//to get all
getButton.onclick = async () => {
    const response = await axios.get(url);
    const students = response.data;
    ul.innerHTML = "";
    for(let student of students) {
        const ulhtml = 
        `
        <li id = ${student._id}>
        <p> ${student.username} </p>
        <button class = "del"> Delete </button>
        <button class = "update"> Update </button>
        </li>
        `;
        ul.innerHTML += ulhtml;
    }
}
getBtn.onclick = async () => {
    const username = input.value;
    if(!username){
        alert("Enter User Name");
    }
    try {
        const response = await axios.get(`${url}/${username}`);
        const student = response.data;
        if(student.username === undefined) {
            div.innerHTML = `<p style = "color: black"> No Data Found <p>`;
        }
        div.innerHTML = `<p style = "color : black">Username: ${student.username} `;
    }
    catch(err) {
        console.log(err);
        
    }
}
document.addEventListener("click", async e => {
    const DelButton = e.target.matches(".del");
   
    const clickedUpdateButton = e.target.matches(".update");


    //to delete
    if(DelButton) {
        const li = e.target.parentElement;
        const idTodelete = li.id;
            li.remove();

            try {
            await axios.delete(`${url}/${idTodelete}`);
            alert("Student Deleted");
            }catch(err) {
                console.log(err);
                alert("Couldn't Delete Student");
            }
        }
        
    //to update 
    if(clickedUpdateButton) {
        var input = prompt("Enter updates" ,'');
        const li = e.target.parentElement;
        const idToUpdate = li.id;
        if(!input) {
            alert("Enter valid details");
        }else{
           try{
            await axios.put(`${url}/${idToUpdate}/${input}`);
            alert("Updates successfull");
            getButton.click();
        }catch(err) {
            console.log(err);
            alert("Could not update student");
        } 
        }
        
    }
})


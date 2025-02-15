const API_URL = 'http://localhost:5000/user/register'; 

// Función para registrar un usuario
document.getElementById('registration-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evitar el envío del formulario

    // Obtener valores de los campos del formulario
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validar que todos los campos estén llenos
    if (name === '' || email === '' || password === '') {
        alert('Todos los campos son obligatorios');
        return;
    }

    try {
        // Enviar solicitud POST para registrar el usuario
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        // Manejar la respuesta
        if (!response.ok) {
            const errorData = await response.json(); // Obtener el mensaje de error del servidor
            throw new Error(errorData.message || 'Error al registrar el usuario');
        }

        const data = await response.json(); // Obtener los datos de la respuesta
        alert('Usuario registrado con éxito');
        localStorage.setItem('token', data.token); // Guardar el token en localStorage
        this.reset(); // Limpiar el formulario
        fetchUsers(); // Actualiza la lista de usuarios
    } catch (error) {
        alert(error.message);
    }
});

// Función para obtener y mostrar usuarios
async function fetchUsers() {
    const userList = document.getElementById('user-list');
    userList.innerHTML = ''; // Limpiar la lista antes de mostrarla

    try {
        const token = localStorage.getItem('token'); // Recuperar el token de localStorage
        if (!token) {
            alert('No estás autenticado. Inicia sesión para ver los usuarios.');
            return;
        }

        // Obtener la lista de usuarios
        const response = await fetch('http://localhost:5000/user/users', {
            headers: {
                'Authorization': `Bearer ${token}` // Incluir el token en los encabezados
            }
        });

        if (!response.ok) {
            const errorData = await response.json(); // Obtener el mensaje de error del servidor
            throw new Error(errorData.message || 'Error al obtener la lista de usuarios');
        }

        const users = await response.json();
        users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.name} (${user.email})`;
            
            // Botón para editar
            const editButton = document.createElement('button');
            editButton.textContent = 'Editar';
            editButton.onclick = () => editUser(user);
            li.appendChild(editButton);

            // Botón para eliminar
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Eliminar';
            deleteButton.onclick = async () => {
                await deleteUser(user._id); // Cambiado a user._id
            };
            li.appendChild(deleteButton);

            userList.appendChild(li);
        });
    } catch (error) {
        alert(error.message);
    }
}

function editUser(user) {
    const name = prompt("Nuevo nombre:", user.name);
    const email = prompt("Nuevo correo electrónico:", user.email);

    if (name && email) {
        const token = localStorage.getItem('token'); // Asegúrate de que el token esté almacenado

        fetch(`http://localhost:5000/user/users/${user._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Incluir el token en los encabezados
            },
            body: JSON.stringify({ name, email })
        })
        .then(response => {
            if (response.status === 401) { // Token inválido
                alert('Token inválido. Por favor, inicia sesión nuevamente.');
                return;
            }
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Error al editar el usuario'); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Usuario editado:', data);
            alert('Usuario editado con éxito');
            fetchUsers(); // Actualiza la lista de usuarios
        })
        .catch(error => {
            console.error('Error al editar usuario:', error);
            alert(error.message);
        });
    }
}

// Función para eliminar un usuario
async function deleteUser(userId) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        try {
            const token = localStorage.getItem('token'); // Asegúrate de que el token esté almacenado

            const response = await fetch(`http://localhost:5000/user/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // Incluir el token en los encabezados
                }
            });

            if (!response.ok) {
                const errorData = await response.json(); // Obtener el mensaje de error del servidor
                throw new Error(errorData.message || 'Error al eliminar el usuario');
            }

            alert('Usuario eliminado con éxito');
            fetchUsers(); // Actualiza la lista de usuarios
        } catch (error) {
            alert(error.message);
        }
    }
}

// Evento para obtener usuarios al cargar la página
document.addEventListener('DOMContentLoaded', fetchUsers);

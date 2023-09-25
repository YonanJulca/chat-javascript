// Capturamos elementos del DOM
const botones = document.querySelector("#botones");
const nombreUsuario = document.querySelector("#nombreUsuario");
const contenidoProtegido = document.querySelector("#contenidoProtegido");
const formulario = document.querySelector("#formulario");
const inputChat = document.querySelector("#inputChat");

// Escuchamos cambios en la autenticación
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    // Si hay un usuario autenticado
    console.log(user);

    // Mostramos botón de cerrar sesión y nombre de usuario
    botones.innerHTML = `
    <button class="btn btn-outline-danger"
    id='btnCerrar'>Cerrar Sesion</button>
    `;

    nombreUsuario.innerHTML = user.displayName;

    // Configuramos la funcionalidad de cerrar sesión
    CerrarSesion();

    // Mostramos el formulario y cargamos el contenido del chat
    formulario.classList = "input-group mb-3 fixed-bottom container";
    contenidoChat(user);
  } else {
    // Si no hay un usuario autenticado
    console.log("no existe user");

    // Mostramos botón de iniciar sesión y mensaje de inicio de sesión requerida
    botones.innerHTML = `
        <button class="btn btn-outline-success mr-2
        " id='btnAcceder'>Acceder</button>
        `;

    iniciarSesion();
    nombreUsuario.innerHTML = "Chat";
    contenidoProtegido.innerHTML = `
    <p class="text-center lead mt-5"> Debes iniciar sesion</p>
    `;

    // Ocultamos el formulario
    formulario.classList = "input-group mb-3 fixed-bottom container d-none";
  }
});

// Función para manejar el contenido del chat
const contenidoChat = (user) => {
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(inputChat.value);
    if (!inputChat.value.trim()) {
      console.log("input vacio");
      return;
    }

    // Guardamos el mensaje en Firestore
    firebase
      .firestore()
      .collection("chat")
      .add({
        texto: inputChat.value,
        uid: user.uid,
        fecha: Date.now(),
      })

      .then((res) => {
        console.log("mensaje guardado");
      })
      .catch((e) => console.log(e));
    inputChat.value = "";
  });

  // Escuchamos cambios en la colección "chat"
  firebase
    .firestore()
    .collection("chat")
    .orderBy("fecha")
    .onSnapshot((query) => {
      contenidoProtegido.innerHTML = ""; // Limpiamos el contenido
      query.forEach((doc) => {
        console.log(doc.data());
        if (doc.data().uid === user.uid) {
          // Si el mensaje pertenece al usuario actual, lo mostramos a la derecha
          contenidoProtegido.innerHTML += `
          <div class="d-flex justify-content-end ">
              <span class="badge rounded-pill bg-primary">
                  ${doc.data().texto}
              </span>
          </div>
          `;
        } else {
          // Si el mensaje pertenece a otro usuario, lo mostramos a la izquierda
          contenidoProtegido.innerHTML += `
          <div class="d-flex justify-content-start ">
              <span class="badge rounded-pill bg-secondary">${
                doc.data().texto
              }</span>
          </div>
          `;
        }
        contenidoProtegido.scrollTop = contenidoProtegido.scrollHeight; // Mantenemos el scroll en la parte inferior
      });
    });
};

// Función para cerrar sesión
const CerrarSesion = () => {
  const btnCerrar = document.querySelector("#btnCerrar");
  btnCerrar.addEventListener("click", () => {
    console.log("me diste click en cerrar");
    firebase.auth().signOut();
  });
};

// Función para iniciar sesión con Google
const iniciarSesion = () => {
  const btnAcceder = document.querySelector("#btnAcceder");
  btnAcceder.addEventListener("click", async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();

      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
  });
};

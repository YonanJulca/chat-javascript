const botones = document.querySelector("#botones");
const nombreUsuario = document.querySelector("#nombreUsuario");
const contenidoProtegido = document.querySelector("#contenidoProtegido");
const formulario = document.querySelector("#formulario");
const inputChat = document.querySelector("#inputChat");

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(user);
    botones.innerHTML = `
    <button class="btn btn-outline-danger"
    id='btnCerrar'>Cerrar Sesion</button>
    `;

    nombreUsuario.innerHTML = user.displayName;
    CerrarSesion();

    formulario.classList = "input-group mb-3 fixed-bottom container";
    contenidoChat(user);
  } else {
    console.log("no existe user");
    botones.innerHTML = `
        <button class="btn btn-outline-success mr-2
        " id='btnAcceder'>Acceder</button>
        `;

    iniciarSesion();
    nombreUsuario.innerHTML = "Chat";
    contenidoProtegido.innerHTML = `
    <p class="text-center lead mt-5"> Debes iniciar sesion</p>
    `;
    formulario.classList = "input-group mb-3 fixed-bottom container d-none";
  }
});

const contenidoChat = (user) => {
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(inputChat.value);
    if (!inputChat.value.trim()) {
      console.log("input vacio");
      return;
    }

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
  firebase
    .firestore()
    .collection("chat")
    .orderBy("fecha")
    .onSnapshot(query => {
      // console.log(query)
      contenidoProtegido.innerHTML = ''
      query.forEach(doc => {
        console.log(doc.data())
        if (doc.data().uid === user.uid) {
          contenidoProtegido.innerHTML += `
          <div class="d-flex justify-content-end ">
              <span class="badge rounded-pill bg-primary">
                  ${doc.data().texto}
              </span>
          </div>
          `
        } else {
          contenidoProtegido.innerHTML += `
          <div class="d-flex justify-content-start ">
              <span class="badge rounded-pill bg-secondary">${doc.data().texto}</span>
          </div>
          `
        }
        contenidoProtegido.scrollTop = contenidoProtegido.scrollHeight
      });
    });
};

const CerrarSesion = () => {
  const btnCerrar = document.querySelector("#btnCerrar");
  btnCerrar.addEventListener("click", () => {
    console.log("me diste click en cerrar");
    firebase.auth().signOut();
  });
};

const iniciarSesion = () => {
  const btnAcceder = document.querySelector("#btnAcceder");
  btnAcceder.addEventListener("click", async () => {
    // console.log('me diste click en acceder')

    try {
      const provider = new firebase.auth.GoogleAuthProvider();

      await firebase.auth().signInWithPopup(provider);
    } catch (error) {
      console.log(error);
    }
  });
};

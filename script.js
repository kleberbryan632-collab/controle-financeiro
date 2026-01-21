// --- LOGIN / CADASTRO ---
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const btnCadastrar = document.getElementById("btnCadastrar");
const loginMsg = document.getElementById("loginMsg");

const loginContainer = document.getElementById("loginContainer");
const appContainer = document.getElementById("appContainer");
const btnLogout = document.getElementById("btnLogout");

let currentUser = null;

// --- CONTROLE FINANCEIRO ---
let saldoInicial = 1000;
let totalGasto = 0;
let gastos = [];

const nomeGastoInput = document.getElementById("nomeGasto");
const valorGastoInput = document.getElementById("valorGasto");
const categoriaGastoSelect = document.getElementById("categoriaGasto");

const saldoDisplay = document.getElementById("saldo");
const totalGastoDisplay = document.getElementById("totalGasto");
const sobrouDisplay = document.getElementById("sobrou");
const listaGastos = document.getElementById("listaGastos");

const btnAdicionar = document.getElementById("btnAdicionar");
const valorReporInput = document.getElementById("valorRepor");
const btnRepor = document.getElementById("btnRepor");

let chart = null;

// --- LOCAL STORAGE ---
function salvarUsuario(user, pass) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    users[user] = { password: pass, saldo: 1000, gastos: [] };
    localStorage.setItem("users", JSON.stringify(users));
}

function carregarUsuario(user) {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[user]) {
        saldoInicial = users[user].saldo;
        gastos = users[user].gastos;
        totalGasto = gastos.reduce((a,b)=>a+b.valor,0);
    }
}

function salvarDadosUsuario() {
    let users = JSON.parse(localStorage.getItem("users")) || {};
    if (users[currentUser]) {
        users[currentUser].saldo = saldoInicial;
        users[currentUser].gastos = gastos;
        localStorage.setItem("users", JSON.stringify(users));
    }
}

// --- LOGIN / CADASTRO ---
btnCadastrar.addEventListener("click", ()=>{
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    if(!username || !password){
        loginMsg.textContent="Digite usuário e senha!";
        return;
    }
    let users = JSON.parse(localStorage.getItem("users")) || {};
    if(users[username]){
        loginMsg.textContent="Usuário já existe!";
        return;
    }
    salvarUsuario(username,password);
    loginMsg.textContent="Usuário cadastrado! Agora faça login.";
});

btnLogin.addEventListener("click", ()=>{
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    let users = JSON.parse(localStorage.getItem("users")) || {};
    if(users[username] && users[username].password === password){
        currentUser = username;
        loginContainer.style.display="none";
        appContainer.style.display="block";
        carregarUsuario(currentUser);
        atualizarDisplay();
    }else{
        loginMsg.textContent="Usuário ou senha incorretos!";
    }
});

btnLogout.addEventListener("click", ()=>{
    currentUser=null;
    appContainer.style.display="none";
    loginContainer.style.display="block";
    usernameInput.value="";
    passwordInput.value="";
    loginMsg.textContent="";
});

// --- CONTROLE FINANCEIRO ---
function atualizarDisplay(){
    saldoDisplay.textContent = saldoInicial.toFixed(2);
    totalGastoDisplay.textContent = totalGasto.toFixed(2);
    sobrouDisplay.textContent = (saldoInicial - totalGasto).toFixed(2);
    sobrouDisplay.style.color = saldoInicial - totalGasto <0 ? "red":"green";

    listaGastos.innerHTML="";
    gastos.forEach(g=>{
        const li = document.createElement("li");
        li.textContent = `${g.nome} (${g.categoria}): R$ ${g.valor.toFixed(2)}`;
        listaGastos.appendChild(li);
    });

    salvarDadosUsuario();
    atualizarGrafico();
}

btnAdicionar.addEventListener("click", ()=>{
    const nome = nomeGastoInput.value.trim();
    const valor = parseFloat(valorGastoInput.value);
    const categoria = categoriaGastoSelect.value;

    if(!nome || isNaN(valor) || valor<=0){
        alert("Preencha os campos corretamente!");
        return;
    }

    gastos.push({nome,valor,categoria});
    totalGasto += valor;

    nomeGastoInput.value="";
    valorGastoInput.value="";
    atualizarDisplay();
});

btnRepor.addEventListener("click", ()=>{
    const valor = parseFloat(valorReporInput.value);
    if(isNaN(valor)||valor<=0){
        alert("Digite um valor válido para repor!");
        return;
    }
    saldoInicial += valor;
    valorReporInput.value="";
    atualizarDisplay();
});

// --- GRÁFICO ---
function atualizarGrafico(){
    const categorias = {};
    gastos.forEach(g=>{
        if(categorias[g.categoria]) categorias[g.categoria]+=g.valor;
        else categorias[g.categoria]=g.valor;
    });
    const labels = Object.keys(categorias);
    const data = Object.values(categorias);
    if(chart) chart.destroy();
    const ctx = document.getElementById("graficoGastos").getContext("2d");
    chart = new Chart(ctx,{
        type:'pie',
        data:{
            labels,
            datasets:[{
                data,
                backgroundColor:["#3498db","#e74c3c","#f1c40f","#2ecc71"]
            }]
        },
        options:{
            plugins:{
                legend:{
                    position:"bottom",
                    labels:{color:"#fff"}
                }
            }
        }
    });
}

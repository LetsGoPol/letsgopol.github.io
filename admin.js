// admin.js – Panel Administrativo
document.addEventListener("DOMContentLoaded", function(){
  // Verificar que el usuario actual es administrador (simulación: user.admin == true)
  let currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || !currentUser.admin) {
    alert("Acceso restringido. Debes ser administrador.");
    location.href = "index.html";
  }
  
  // Cargar horario desde localStorage (si existe)
  const scheduleTable = document.getElementById("adminScheduleTable");
  let schedule = JSON.parse(localStorage.getItem("schedule")) || [
    {dia:"Lunes", hora:"7:00 PM"},
    {dia:"Miércoles", hora:"7:00 PM"},
    {dia:"Viernes", hora:"9:00 PM"}
  ];
  function renderSchedule() {
    scheduleTable.innerHTML = "";
    schedule.forEach((item, index) => {
      let row = `<tr>
        <td>${item.dia}</td>
        <td>${item.hora}</td>
        <td><button onclick="deleteSchedule(${index})">Eliminar</button></td>
      </tr>`;
      scheduleTable.innerHTML += row;
    });
  }
  renderSchedule();
  
  // Manejar formulario para agregar nuevo horario
  document.getElementById("adminScheduleForm").addEventListener("submit", function(e){
    e.preventDefault();
    let dia = document.getElementById("adminDia").value.trim();
    let hora = document.getElementById("adminHora").value.trim();
    schedule.push({dia, hora});
    localStorage.setItem("schedule", JSON.stringify(schedule));
    renderSchedule();
    this.reset();
  });
  
  window.deleteSchedule = function(index) {
    schedule.splice(index, 1);
    localStorage.setItem("schedule", JSON.stringify(schedule));
    renderSchedule();
  }
  
  // Gestión de pedidos: se simula que los pedidos se almacenan en localStorage como array de objetos.
  const ordersTable = document.getElementById("adminOrdersTable");
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  function renderOrders() {
    ordersTable.innerHTML = "";
    orders.forEach((order, index) => {
      let row = `<tr>
        <td>${order.id}</td>
        <td>${order.usuario}</td>
        <td>${order.producto}</td>
        <td id="orderStatus_${index}">${order.estado}</td>
        <td>
          <select onchange="updateOrderStatus(${index}, this.value)">
            <option value="en proceso">En Proceso</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
            <option value="en camino">En Camino</option>
          </select>
          <button onclick="deleteOrder(${index})">Eliminar</button>
        </td>
      </tr>`;
      ordersTable.innerHTML += row;
    });
  }
  renderOrders();
  
  window.updateOrderStatus = function(index, status) {
    orders[index].estado = status;
    localStorage.setItem("orders", JSON.stringify(orders));
    document.getElementById("orderStatus_" + index).textContent = status;
  }
  
  window.deleteOrder = function(index) {
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
  }
  
  // Crear código secreto para canjear monedas
  document.getElementById("adminCodeForm").addEventListener("submit", function(e){
    e.preventDefault();
    let newCode = document.getElementById("newCode").value.trim();
    let codeValue = parseInt(document.getElementById("codeValue").value);
    let secretCodes = JSON.parse(localStorage.getItem("secretCodes")) || [];
    secretCodes.push({code: newCode, value: codeValue});
    localStorage.setItem("secretCodes", JSON.stringify(secretCodes));
    alert("Código creado: " + newCode + " (" + codeValue + " monedas)");
    this.reset();
  });
});

class CustomerApp {
  constructor() {
    this.customers = [];
    this.currentPage = 1;
    this.initializeComponents();
  }
  initializeComponents() {
    this.searchButton = document.getElementById("search-button");
    this.searchInput = document.getElementById("search-input");
    this.customerList = document.getElementById("list-customers");
    this.pagination = document.getElementById("pagination");
    this.itemsPerPage = 5;
    this.searchButton.addEventListener("click", this.searchCustomers.bind(this));
    this.originalCustomerList = Array.from(this.customerList.getElementsByTagName("tr"));
  }

  // Gọi API để lấy danh sách khách hàng
  async getCustomers() {
    try {
      const response = await fetch('http://localhost:3000/customers');
      const data = await response.json();
      this.customers = data;
      this.renderCustomers();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách khách hàng:', error);
    }
  }

  // Hiển thị danh sách khách hàng trong bảng
  renderCustomers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedCustomers = this.customers.slice(startIndex, endIndex);
    const listCustomers = document.getElementById('list-customers');
    listCustomers.innerHTML = '';

    paginatedCustomers.forEach((customer) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.firstname}</td>
        <td>${customer.lastname}</td>
        <td>${customer.username}</td>
        <td>${customer.email}</td>
        <td>${customer.address}</td>
        <td>
          <button class="btn btn-primary" onclick="app.openEditModal(${customer.id})">Sửa</button>
          <button class="btn btn-danger" onclick="app.deleteCustomer(${customer.id})">Xóa</button>
        </td>
      `;
      
      listCustomers.appendChild(row);
    });
    this.renderPagination();
  }
 // Hiển thị phân trang
 renderPagination() {
  const totalPages = Math.ceil(this.customers.length / this.itemsPerPage);
  this.pagination.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerText = i;
    pageButton.addEventListener('click', () => {
      this.currentPage = i;
      this.renderCustomers();
    });
    this.pagination.appendChild(pageButton);
  }
}
  // Mở modal thêm khách hàng
  openAddModal() {
    const addModal = document.getElementById('add-modal');
    addModal.style.display = 'block';
  }

  // Đóng modal
  closeModal() {
    const modals = document.getElementsByClassName('modal');
    for (const modal of modals) {
      modal.style.display = 'none';
    }
  }

  // Thêm khách hàng mới
  async addCustomer() {
    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;

    try {
      const response = await fetch('http://localhost:3000/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          lastname,
          username,
          email,
          address,
        }),
      });
      const data = await response.json();
      this.customers.push(data);
      this.renderCustomers();
      this.closeModal();
    } catch (error) {
      console.error('Lỗi khi thêm khách hàng:', error);
    }
  }

  // Mở modal sửa thông tin khách hàng
  openEditModal(customerId) {
    const customer = this.customers.find((e) => e.id === customerId);
    if (customer) {
      const editModal = document.getElementById('edit-modal');
      editModal.style.display = 'block';

      document.getElementById('edit-firstname').value = customer.firstname;
      document.getElementById('edit-lastname').value = customer.lastname;
      document.getElementById('edit-username').value = customer.username;
      document.getElementById('edit-email').value = customer.email;
      document.getElementById('edit-address').value = customer.address;

      // Lưu customerId vào biến ẩn để sử dụng khi submit form
      document.getElementById('edit-modal').dataset.customerId = customerId;
    }
  }

  // Cập nhật thông tin khách hàng
  async updateCustomer() {
    const customerId = document.getElementById('edit-modal').dataset.customerId;
    const firstname = document.getElementById('edit-firstname').value;
    const lastname = document.getElementById('edit-lastname').value;
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;
    const address = document.getElementById('edit-address').value;

    try {
      const response = await fetch(`http://localhost:3000/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname,
          lastname,
          username,
          email,
          address,
        }),
      });
      const data = await response.json();

      // Cập nhật thông tin khách hàng trong danh sách
      const customerIndex = this.customers.findIndex((e) => e.id === customerId);
      if (customerIndex !== -1) {
        this.customers[customerIndex] = data;
        this.renderCustomers();
        this.closeModal();
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật khách hàng:', error);
    }
  }

  // Xóa khách hàng
  async deleteCustomer(customerId) {
    // Hiển thị thông báo xác nhận khi người dùng muốn xóa khách hàng
    const confirmed = confirm("Bạn có muốn xóa khách hàng này?");
  
    if (confirmed) {
      try {
        await fetch(`http://localhost:3000/customers/${customerId}`, {
          method: 'DELETE',
        });
  
        // Xóa khách hàng khỏi danh sách
        this.customers = this.customers.filter((e) => e.id !== customerId);
        this.renderCustomers();
      } catch (error) {
        console.error('Lỗi khi xóa khách hàng:', error);
      }
    }
  }

  // Tìm kiếm khách hàng
// Tìm kiếm khách hàng
searchCustomers() {
  const searchTerm = this.searchInput.value.toLowerCase();
  const customers = this.customerList.getElementsByTagName("tr");

  let foundResults = false;

  Array.from(customers).forEach((customer) => {
    const firstName = customer.getElementsByTagName("td")[1].innerText.toLowerCase();
    const lastName = customer.getElementsByTagName("td")[2].innerText.toLowerCase();

    if (firstName.includes(searchTerm) || lastName.includes(searchTerm)) {
      customer.style.display = "table-row";
      foundResults = true;
    } else {
      customer.style.display = "none";
    }
  });

  this.currentPage = 1; // Reset lại trang hiện tại khi tìm kiếm

  if (!foundResults) {
    const confirmed = confirm("Không tìm thấy khách hàng phù hợp. Bạn có muốn tạo khách hàng mới?");

    if (confirmed) {
      this.openAddModal();
    }
  }
}

}

// Khởi tạo ứng dụng và gọi API để lấy danh sách khách hàng
const app = new CustomerApp();
app.getCustomers();

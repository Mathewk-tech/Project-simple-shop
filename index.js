const buttons = document.querySelectorAll("button[data-category]"); // FIXED (was only 1 button) 
const productSection = document.getElementById("products"); // FIXED: make sure variable matches function so that we dont have errors
const url = "https://fakestoreapi.com/products";
let allproducts = [];
const m =document.getElementById("items");
const z=document.getElementById('total');
let cart=[];//here we are saying we have an array for cart but its = to 0 for now

// Payment related variables
const BACKEND_URL = ' https://cationic-nonhabitually-joella.ngrok-free.dev'; // Backend URL for M-Pesa API
const PAYMENT_PHONE = '254708799547'; // Fixed phone number for payment
let paymentLoading = false;

// Add event listener for back button
document.getElementById('back-to-products').addEventListener('click', showAllProducts);

// Add event listener for purchase button
document.getElementById('purchase-btn').addEventListener('click', handlePurchase);

// Add event listener for continue button
document.getElementById('continue-btn').addEventListener('click', showProductsPage);

// Initially hide controls and products, show welcome
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('controls').style.display = 'none';
    document.getElementById('products').style.display = 'none';
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('welcome').style.display = 'block';
    document.getElementById('main-title').style.display = 'block'; // Show title on welcome

    fetch(url)//we do this to fecth data in our api
    .then(res => res.json())//this is like saying,hi..the api we have fetched let's make it to now be in json which is always in string form btw
    .then(data => {
//now we have our json in strng form..nice..so now whe we say .then(data=>{})we saying lets now do something with this data...which the api data...data here is just like 
//a name...but its special cause anything thats named after converting our api details into json..it becomes the apis data
//so here i said let that data to be = to allproducts so that i can access it later..
        allproducts = data;
//why showproducts(data)?..well lets just say we want to see all the products.well our showproducts function dosent really show all products..
//so when we say showproducts(data) we're lie telling it callback the function but this time replace its parameter with data...which remember 
//=to all products...so know when we 
        // Don't show products yet, wait for continue button
    });
});

// Function to show products page
function showProductsPage() {
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('controls').style.display = 'flex';
    document.getElementById('products').style.display = 'grid';
    document.getElementById('main-title').style.display = 'none'; // Hide title on products
    showProducts(allproducts);
}

//step two is creating a function that shows all products
function showProducts(products){
    productSection.innerHTML='';

    products.forEach(product => {
        const div=document.createElement("div");
        div.className='product';

        //the const rating checks if in my api there is rating..if not it defaults it to 0
        const rating = product.rating ? product.rating.rate : 0;
        //math.floor rounds off the rating to a whole number
        const fullStars = Math.floor(rating);
        //so that we don't get rid of of the half star rating we do this...at times it can be 0.8 not 0.5...
        //so this says that even if its greater than 0.5 just make it a half rating
        const halfStar = rating % 1 >= 0.5;
        //this just subtracts to get how many empty satrs are remaining to make a five star rating
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        let starsHtml = '';//this just clears everything and whatever result will be obtained below is what will be put inside the empty starsHtml
        for (let i = 0; i < fullStars; i++) starsHtml += '★';
        if (halfStar) starsHtml += '☆';//i couldn't find a half rating star so i just put ½
        for (let i = 0; i < emptyStars; i++) starsHtml += '☆';

        div.innerHTML=`
          <h3>${product.title}</h3>
          <p><strong>Category:</strong> ${product.category}</p>
          ${product.image ? `<img src="${product.image}" alt="${product.title}">` : ''}
          <p><strong>Price:</strong> KSH ${product.price}</p> 
          <p><strong>Rating:</strong> <span class="rating-stars">${starsHtml}</span> (${rating})</p>
          <button class="add-to-cart" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}">Add to Cart</button>
        `;
        productSection.appendChild(div);
    
    });
    const u=document.querySelectorAll('.add-to-cart');
    u.forEach(buttuon =>{
        buttuon.addEventListener('click',function(){
        const title=this.dataset.title;
        const price=parseFloat(this.dataset.price);
        const image = this.dataset.image;
        cart.push({title,price,image});
        updatecart();
        showNotification();
    })

    })
    
}

function updatecart(){
    const itemList=document.getElementById("items");
    const totaldisplay=document.getElementById("total");
    const cartCount = document.getElementById("cart-count");
    const purchaseBtn = document.getElementById("purchase-btn");
    itemList.innerHTML='';
    let total=0;

    cart.forEach((item, index) =>{
        const li=document.createElement('li');

        li.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <span>${item.title}</span>
            <strong>KSH ${item.price}</strong>
            <button class="delete-item" data-index="${index}">Delete</button>
        `;

       
        itemList.appendChild(li);
        total +=item.price;
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            cart.splice(index, 1);
            updatecart();
            showNotification();
        });
    });
    
    totaldisplay.textContent = total.toFixed(2);
    cartCount.textContent = cart.length;
    
    // Show/hide purchase button based on cart contents
    if (cart.length > 0 && !paymentLoading) {
        purchaseBtn.style.display = 'block';
    } else {
        purchaseBtn.style.display = 'none';
    }
}


//assuming someone wants to see all products or men's wear they can just simply click the button and the data that is stored in our api will display
//depending on the button category clicked..this has to be in a loop so for it to work we wll use a foreach loop but there has to be an event listener
//to listen for a button click

buttons.forEach(button=>{
 button.addEventListener('click', ()=>{
 //we must first of all get the category
 const category = button.dataset.category.toLowerCase();
 if(category==='cart'){
    document.getElementById('cart-section').style.display = 'block';
    productSection.style.display = 'none';
    document.getElementById('main-title').style.display = 'none'; // Hide title in cart

    updatecart(); // Refresh cart items display
    return; // Stop here

 }
   // Show products
    document.getElementById('products').style.display = 'grid';
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('main-title').style.display = 'none'; // Hide title on products

     if (category === 'all') {
            showProducts(allproducts);
        } else {
            const filtered = allproducts.filter(p => p.category === category);
            showProducts(filtered);
        }
})
})

function showAllProducts() {
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('products').style.display = 'grid';
    document.getElementById('main-title').style.display = 'none'; // Hide title on products
    showProducts(allproducts); // refresh product display
}

function showNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// Payment helper functions
function showPaymentLoading() {
    document.getElementById('payment-loading').style.display = 'block';
    document.getElementById('payment-success').style.display = 'none';
    document.getElementById('payment-error').style.display = 'none';
    document.getElementById('purchase-btn').style.display = 'none';
    paymentLoading = true;
}

function hidePaymentLoading() {
    document.getElementById('payment-loading').style.display = 'none';
    paymentLoading = false;
    updatecart(); // This will show the purchase button again if cart not empty
}

function showPaymentSuccess() {
    document.getElementById('payment-success').style.display = 'block';
    document.getElementById('payment-error').style.display = 'none';
    // Clear cart on successful payment
    cart = [];
    updatecart();
}

function showPaymentError(message) {
    document.getElementById('payment-error').style.display = 'block';
    document.getElementById('payment-error').textContent = message;
    document.getElementById('payment-success').style.display = 'none';
}

// Handle M-Pesa purchase
async function handlePurchase() {
    const total = parseFloat(document.getElementById('total').textContent);
    
    if (total <= 0) {
        showPaymentError('Cart is empty. Add products before payment.');
        return;
    }
    
    showPaymentLoading();
    
    try {
        const requestData = {
            phoneNumber: PAYMENT_PHONE,
            amount: total.toFixed(2)
        };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const response = await fetch(`${BACKEND_URL}/api/mpesa/stk-push`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const data = await response.json();
            showPaymentSuccess();
        } else {
            let errorMessage = 'Payment failed. Please try again.';
            try {
                const errorData = await response.json();
                if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (parseError) {
                // Ignore
            }
            showPaymentError(errorMessage);
        }
        
    } catch (err) {
        if (err.name === 'AbortError') {
            showPaymentError('Request timed out. Please check your connection and try again.');
        } else if (err.message.includes('fetch')) {
            showPaymentError('Network error. Please check your internet connection and try again.');
        } else {
            showPaymentError('An unexpected error occurred. Please try again.');
            console.error('Payment request failed:', err.message);
        }
    } finally {
        hidePaymentLoading();
    }
}




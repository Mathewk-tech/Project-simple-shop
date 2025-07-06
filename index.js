const buttons = document.querySelectorAll("button[data-category]"); // FIXED (was only 1 button) 
const productSection = document.getElementById("products"); // FIXED: make sure variable matches function so that we dont have errors
const url = "https://fakestoreapi.com/products";
let allproducts = [];
const m =document.getElementById("items");
const z=document.getElementById('total');
let cart=[];//here we are saying we have an array for cart but its = to 0 for now

//step one is loading all the data when the document is opened by fetching data from the api
document.addEventListener('DOMContentLoaded', function() {
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
        showProducts(data);
    });
});

//step two is creating a function that shows all products
function showProducts(products){
    productSection.innerHTML='';
    // Set grid styles for the product section container
    //products in our db.json is an array, not an object so we cant use products.category

    productSection.style.display = 'grid';
    if (products[0].category === "electronics") {
        productSection.style.gridTemplateColumns = 'repeat(3, 1fr)';
        productSection.style.gap = '20px';
        productSection.style.padding = '60px';
    } else if (products[0].category === "women's clothing") {
        productSection.style.gridTemplateColumns = 'repeat(3, 1fr)';
        productSection.style.gap = '20px';
        productSection.style.padding = '60px';
    } else {
        productSection.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        productSection.style.gap = '20px';
        productSection.style.padding = '60px';
    }
    products.forEach(product => {
        const div=document.createElement("div");
        div.className='product';
        div.style.background='white';
        div.style.color='black';
        div.style.padding='40px';
        div.style.borderRadius='8px';
        div.style.boxShadow='0 0 5px rgba(0,0,0,0.1)';
        

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
        if (halfStar) starsHtml += '½';//i couldn't find a half rating star so i just put ½
        for (let i = 0; i < emptyStars; i++) starsHtml += '☆';

        div.innerHTML=`
          <h3>${product.title}</h3>
          <p><strong>Category:</strong> ${product.category}</p>
          ${product.image ? `<img src="${product.image}" width="100px">` : ''}
          <p><strong>Price:</strong> KSH ${product.price}</p> 
          <p><strong>Rating:</strong> <span style="color: gold; font-size: 1.2em;">${starsHtml}</span> (${rating})</p>
          <button class="add-to-cart" data-title="${product.title}" data-price="${product.price}" data-image="${product.image}" style="cursor: pointer;">Add to cart</button>
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
    })

    })
    
}

function updatecart(){
    const itemList=document.getElementById("items");
    const totaldisplay=document.getElementById("total");
    itemList.innerHTML='';
    let total=0;

    cart.forEach(item =>{
        const li=document.createElement('li');
        li.style.display="flex";
        li.style.alignItems="center";
        li.style.marginBottom="10px";

        li.innerHTML = `
            <img src="${item.image}" width="50px" height="50px" style="margin-right: 10px;">
            <span style="flex: 1;">${item.title}</span>
            <strong>KSH ${item.price}</strong>
        `;

       
        itemList.appendChild(li);
        total +=item.price;
    });
    totaldisplay.textContent = total.toFixed(2);
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
    productSection.style.backgroundImage = 'none'; 
    productSection.style.display = 'none';

    updatecart(); // Refresh cart items display
    return; // Stop here

 }
   // Show products
    document.getElementById('products').style.display = 'grid';
    document.getElementById('cart-section').style.display = 'none';

     if (category === 'all') {
            showProducts(allproducts);
        } else {
            const filtered = allproducts.filter(p => p.category === category);
            showProducts(filtered);
        }

        const imageUrl = button.dataset.image;
        if (imageUrl) {
            productSection.style.backgroundImage = `url('${imageUrl}')`;
            productSection.style.backgroundSize = 'cover';
            productSection.style.backgroundPosition = 'center';
            productSection.style.backgroundRepeat = 'no-repeat';
        }

})
})

function showAllProducts() {
    document.getElementById('cart-section').style.display = 'none';
    document.getElementById('products').style.display = 'grid';
    productSection.style.backgroundImage = 'none'; 
    showProducts(allproducts); // refresh product display
}




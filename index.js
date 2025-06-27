const buttons = document.querySelectorAll("button[data-category]"); // FIXED (was only 1 button) 
const productSection = document.getElementById("products"); // FIXED: make sure variable matches function so that we dont have errors
const url = "https://fakestoreapi.com/products";
let allproducts = [];
const m =document.getElementById("items");
const z=document.getElementById('total');
let cart=[]//here we are saying we have an array for cart but its = to 0 for now

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

    products.forEach(product => {
        const div=document.createElement("div");
        div.className='product';
        div.innerHTML=`
          <h3>${product.title}</h3>
            <p><strong>Category:</strong> ${product.category}</p>
            ${product.image ?`<img src="${product.image}" width="100px">` : ''}
            <p><strong>Price:</strong> ${product.price}</p>
            <button data-id="${product.id}">Add to cart</button>`;
            productSection.appendChild(div);
    });
}


//assuming someone wants to see all products or men's wear they can just simply click the button and the data that is stored in our api will display
//depending on the button category clicked..this has to be in a loop so for it to work we wll use a foreach loop but there has to be an event listener
//to listen for a button click

buttons.forEach(buttuon=>{
 buttuon.addEventListener('click', ()=>{
 //we must first of all get the category
 const category=buttuon.dataset.category;
 if(category==='all'){
    showProducts(allproducts);//which if you remember we had made it = to the data in api in line 12
 }else{
    const x=allproducts.filter(p=>p.category===category);//this is a boolean that will only return true values..that is it will only return if the value is = to the 
    //value in the api
    showProducts(x);
 }
 })
})



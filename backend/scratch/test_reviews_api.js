async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/reviews/product/1');
        const text = await res.text();
        console.log(res.status, text);
    } catch(e) {
        console.log("ERROR:", e);
    }
}
test();

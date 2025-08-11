function formatRupiah(amount: Number | undefined) {
    if (typeof amount === "number") {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0 // no decimals
        }).format(amount);
    } 
    return 'Rp.-'
}

export default formatRupiah
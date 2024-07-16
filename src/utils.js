export function plotPanel(id, mount) {
    var pp = document.querySelector(`#${id}`);
    if (pp) return pp;
    pp = document.createElement("div");
    pp.id = id;
    mount(pp);
    return pp;
}
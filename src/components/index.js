import CutImg from './CutImg'

const cutimg = {
  install (Vue ,options){
    Vue.component(CutImg.name ,CutImg);
  }
};
if(typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(cutimg);
}
export default cutimg;

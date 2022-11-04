import analysisStore from './analysisStore';
import predictCompareStore from './predictCompareStore';
import odStore from './odStore';

//ES6新语法，赋值语句右侧是一个对象，采用了简写形式。把变量作为对象的key，变量的内容作为对象的value
const store = {
  analysisStore,
  predictCompareStore,
  odStore,
}
export default store;
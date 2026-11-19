/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {
    colors: { blue: {50:'#eff3e8',100:'#e4ecd9',200:'#c9d8bc',300:'#a9bf9a',400:'#86a675',500:'#648454',600:'#4f7145',700:'#3f6039',800:'#345431',900:'#294736'}, slate: {50:'#f7f8f4',100:'#eef0e9',200:'#dce1d5',300:'#c6cebe',400:'#8f9b86',500:'#75816b',600:'#5e6c57',700:'#475641',800:'#32452d',900:'#23332d'} },
    borderRadius: {'2xl':'10px','3xl':'12px'},
    boxShadow: {sm:'0 1px 2px rgb(35 51 45 / 3%)',md:'0 2px 6px rgb(35 51 45 / 4%)',lg:'0 3px 12px rgb(35 51 45 / 4%)',xl:'0 4px 16px rgb(35 51 45 / 5%)'},
  } }, plugins: [],
};

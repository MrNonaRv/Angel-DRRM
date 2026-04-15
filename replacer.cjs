const fs = require('fs');

function replaceInFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/ItemCondition\.MAAYO_PA/g, 'ItemCondition.GOOD');
  content = content.replace(/ItemCondition\.MAAYO/g, 'ItemCondition.VERY_GOOD');
  content = content.replace(/ItemCondition\.KINANGLAN_AYUHON/g, 'ItemCondition.NEEDS_REPAIR');
  content = content.replace(/ItemCondition\.DILI_NA_MAGAMIT/g, 'ItemCondition.UNUSABLE');
  
  content = content.replace(/LogStatus\.GIHIRAM/g, 'LogStatus.BORROWED');
  content = content.replace(/LogStatus\.GIBALIK/g, 'LogStatus.RETURNED');
  
  // Enums definitions
  content = content.replace(/MAAYO_PA =/g, 'GOOD =');
  content = content.replace(/MAAYO =/g, 'VERY_GOOD =');
  content = content.replace(/KINANGLAN_AYUHON =/g, 'NEEDS_REPAIR =');
  content = content.replace(/DILI_NA_MAGAMIT =/g, 'UNUSABLE =');
  
  content = content.replace(/GIHIRAM =/g, 'BORROWED =');
  content = content.replace(/GIBALIK =/g, 'RETURNED =');

  // Hardcoded strings in server.ts
  content = content.replace(/'MAAYO_PA'/g, "'GOOD'");
  content = content.replace(/'MAAYO'/g, "'VERY_GOOD'");
  content = content.replace(/'KINANGLAN_AYUHON'/g, "'NEEDS_REPAIR'");
  content = content.replace(/'DILI_NA_MAGAMIT'/g, "'UNUSABLE'");
  
  content = content.replace(/'GIHIRAM'/g, "'BORROWED'");
  content = content.replace(/'GIBALIK'/g, "'RETURNED'");

  fs.writeFileSync(file, content);
}

replaceInFile('src/types.ts');
replaceInFile('src/App.tsx');
replaceInFile('server.ts');

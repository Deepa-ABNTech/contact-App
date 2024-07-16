const { exec } = require('child_process');
 
// Change directory to the project folder and run npm start woswfyjvgh
exec('npm start', { cwd: './' }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error.message}`);
    return;
  }
 
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
 
  console.log(`stdout: ${stdout}`);
});

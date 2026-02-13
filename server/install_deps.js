import { execSync } from 'child_process';

const dependencies = [
    '@aws-sdk/client-s3',
    'multer-s3'
];

console.log('Starting installation of:', dependencies.join(', '));

try {
    // Run npm install using cmd /c on Windows to be safe
    const command = `npm install ${dependencies.join(' ')}`;
    console.log(`Running: ${command}`);

    execSync(command, { stdio: 'inherit' });

    console.log('Installation completed successfully!');
} catch (error) {
    console.error('Installation failed:', error.message);
    process.exit(1);
}

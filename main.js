const { Plugin } = require('obsidian');

const FOLDER_PATH = 'Sources/Snipd';

class HeadingToFilenamePlugin extends Plugin {
  async onload() {
    console.log('Loading HeadingToFilenamePlugin');
    
    // Handle file modifications
    this.registerEvent(
      this.app.vault.on('modify', (file) => this.handleFile(file))
    );
    
    // Handle new file creations
    this.registerEvent(
      this.app.vault.on('create', (file) => this.handleFile(file))
    );
  }

  async handleFile(file) {
    console.log('Checking file:', file.path);
    if (file.path.startsWith(FOLDER_PATH) && file.extension === 'md') {
      console.log('File is in target folder and is markdown');
      let content = await this.app.vault.read(file);
      const firstHeading = this.getFirstHeading(content);
      if (firstHeading) {
        console.log('Found first heading:', firstHeading);
        const newName = this.sanitizeFileName(firstHeading) + '.md';
        if (file.name !== newName) {
          console.log('Renaming file to:', newName);
          await this.app.fileManager.renameFile(file, `${file.parent.path}/${newName}`);
          
          // Remove the first heading from the content
          content = this.removeFirstHeading(content);
          await this.app.vault.modify(file, content);
          console.log('Removed first heading from file content');
        }
      }
    }
  }

  getFirstHeading(content) {
    const match = content.match(/^#\s+(.+)$/m);
    return match ? match[1] : null;
  }

  removeFirstHeading(content) {
    return content.replace(/^#\s+.+\n?/, '').trim();
  }

  sanitizeFileName(name) {
    return name
      .replace(/[/\\?%*:|"<>]/g, '') // Remove characters not allowed in filenames
      .replace(/\s+/g, ' ')          // Replace multiple spaces with a single space
      .trim();                       // Remove leading and trailing spaces
  }
}

module.exports = HeadingToFilenamePlugin;
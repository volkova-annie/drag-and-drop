import React, {Component} from 'react';
import styles from "./styles.css";

class DragAndDrop extends Component {
  constructor(props) {
    super(props);

    this.onDragOverListener = this.onDragOverListener.bind(this);
    this.onDropListener = this.onDropListener.bind(this);
    this.onDragLeaveListener = this.onDragLeaveListener.bind(this);
    this.onDragEnterListener = this.onDragEnterListener.bind(this);
    this.onSelectFiles = this.onSelectFiles.bind(this);
    this.processJson = this.processJson.bind(this);

    this.state = {
    	result: [],
	    errors: [],
    }
  };

  componentDidMount() {
	  document.addEventListener('dragover', function(event) {
		  event.preventDefault();
	  });
	  document.addEventListener('drop', function(event) {
		  event.preventDefault();
	  });
  }

	setDraggableClass(component, isDraggable) {
		if (isDraggable) {
			component.classList.add(styles.dragging);
		} else {
			component.classList.remove(styles.dragging);
		}
	}

	isJsonValide(json) {
		try {
			return JSON.parse(json);
		}
		catch (error) {
			this.setState({errors: [...this.state.errors, error.toString()]});
		}
		return false;
	}

	countObjects(string) {
	  const openCurlyBrace = '{';
	  const closeCurlyBrace = '}';
	  let counterObjects = 0;
		let numOpenBraces = 0;

	  for (let i = 0; i < string.length; i++) {
	    const element = string[i];
	    if (element === openCurlyBrace) {
		    numOpenBraces++;
      }
      else if (element === closeCurlyBrace) {
	      if (--numOpenBraces < 0) {
		      this.setState({errors: [...this.state.errors, 'Wrong json']});
	        return;
        }
	      counterObjects++;
      }
    }
		if (numOpenBraces > 0) {
			this.setState({errors: [...this.state.errors, 'Wrong json']});
		}
		return counterObjects;
  }

	processJson(data, name) {
	  if (this.isJsonValide(data)) {
	    const countObjects = this.countObjects(data);
		  this.setState({result: [...this.state.result, `Number of objects in ${name}: ${countObjects}`]});
    } else {
		  this.setState({ errors: [...this.state.errors, 'Invalid format']});
    }
  }

	readFiles(files) {
		let reader = new FileReader();
		const filesArray = [...files];
		const allowedTypes = ['application/json'];
		let fileName = '';

		let errors = [];

		const readNext = () => {
			const target = filesArray.shift();
			if (target) {
				if (allowedTypes.indexOf(target.type) === -1) {
					errors.push(`Unsupported file type: ${target.name}`);
					readNext();
					return;
				}
				fileName = target.name;
				reader.readAsBinaryString(target);
			} else {
				this.setState({errors: [...this.state.errors, ...errors]});
			}
		};

		reader.onload = () => {
      this.processJson(reader.result, fileName);
		};

		reader.onloadend = function() {
			readNext();
		};

		reader.onerror = function() {
			this.setState({errors: [...this.state.errors, reader.error]});
		};

		readNext();
	}

	onSelectFiles(event) {
		this.readFiles(event.target.files);
		this.clearOutput();
	}

	onDragOverListener(event) {
    event.preventDefault();
		if (event.dataTransfer.types.indexOf('Files') !== -1) {
			this.setDraggableClass(event.currentTarget, true);
		}
  }

	onDropListener(event) {
    event.preventDefault();
    this.readFiles(event.dataTransfer.files);

		this.setDraggableClass(event.currentTarget, false);
  }

	onDragLeaveListener(event) {
		this.setDraggableClass(event.currentTarget, false);
  }

	onDragEnterListener(event) {
		this.clearOutput();
	}

	clearOutput() {
		this.setState({result: [], errors: []});
	}

  render() {
    return (
    	<div className={styles.wrapper}>
	      <form
	        onDragOver={this.onDragOverListener}
	        onDrop={this.onDropListener}
	        onDragLeave={this.onDragLeaveListener}
	        onDragEnter={this.onDragEnterListener}
	        className={styles.form}
	        encType="multipart/form-data">
		      <label
			      className={styles.label}
			      htmlFor="file">
			      Drag files here or click to upload (.json)
		        <input
		          className={styles.input}
		          type="file"
		          multiple
		          onChange={this.onSelectFiles}/>
		      </label>
		      <div className={styles['wrapper-result']}>
			      {this.state.result.map((result, key) => <span key={key} className={styles.result}>{result}</span>)}
			      {this.state.errors.map((error, key) => <span key={key} className={styles.error}>{error}</span>)}
		      </div>
	      </form>

	    </div>
    )
  }
}

export default DragAndDrop;
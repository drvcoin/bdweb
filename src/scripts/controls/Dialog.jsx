const UI = require("../Ui.js").UI;
const loc = UI.loc;


class DialogHeader extends React.PureComponent {
  constructor(props) {
    super(props);

    this._bg = this.props.bg ? this.props.bg : "bg-secondary";
    this._fg = this.props.fg ? this.props.fg : "text-white";
  }

  __renderDefault() {
    return (
      <div class={`modal-header ${this._fg} ${this._bg}`}>
        <h5 class="modal-title font-weight-bold">{ this.props.title }</h5>
        {
          this.props.showCloseButton
          ? (
            <button type="button" class={`close ${this._fg}`} data-dismiss="modal" aria-label={loc("Close")}>
              <span aria-hidden="true">&times;</span>
            </button>
          )
          : (null)
        }
      </div>
    );
  }


  __renderCustom() {
    return (
      <div class="modal-header">
        { this.props.children }
      </div>
    );
  }


  render() {
    if (!this.props.custom) {
      return this.__renderDefault();
    } else {
      return this.__renderCustom();
    }
  }
}


class DialogBody extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="modal-body">
        { this.props.children }
      </div>
    );
  }
}


class DialogFooter extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div class="modal-footer">
        { this.props.children }
      </div>
    );
  }
}


class Dialog extends React.PureComponent {
  constructor(props) {
    super(props);

    this._id = this.props.id;
    if (!this._id) {
      this._id = UI.nextGlobalId();
    }

    let idSelector = `#${this._id}`;

    $(document).off("show.bs.modal");
    $(document).off("shown.bs.modal");
    $(document).off("hide.bs.modal");
    $(document).off("hidden.bs.modal");

    if (this.props.onShow) {
      $(document).on("show.bs.modal", idSelector, this.props.onShow);
    }

    if (this.props.onShown) {
      $(document).on("shown.bs.modal", idSelector, this.props.onShown)
    }

    if (this.props.onHide) {
      $(document).on("hide.bs.modal", idSelector, this.props.onHide);
    }

    if (this.props.onHidden) {
      $(document).on("hidden.bs.modal", idSelector, this.props.onHidden)
    }
  }


  get id() {
    return this._id;
  }


  render() {
    return (
      <div class="modal fade" tabindex="-1" role="dialog" data-backdrop="static" id={this._id}>
        <div class="modal-dialog modal-dialog-centered" role="document">
          <div class="modal-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }


  static show(component) {
    let dialog = component.render ? component.render() : component;
    ReactDOM.render(dialog, document.getElementById("dialog-container"), function() {
      $(`#${this._id}`).modal("show");
    });
  }
}


const MessageBoxButtons = {
  OK : 1,
  Cancel : 2,
  Yes : 4,
  No : 8
};


const MessageBoxLevel = {
  Default : 0,
  Info : 1,
  Warning : 2,
  Error : 3
};


class MessageBox extends React.PureComponent {
  constructor(props) {
    super(props);

    this._id = this.props.id;
    if (!this._id) {
      this._id = UI.nextGlobalId();
    }

    this._buttons = this.props.buttons;
    if (!this._buttons || this._buttons.length < 1) {
      this._buttons = MessageBoxButtons.OK;
    }

    this._result = this.props.defaultButton;
    if (!this._result) {
      if (this._buttons & MessageBoxButtons.Cancel) {
        this._result = MessageBoxButtons.Cancel;
      } else if (this._buttons & MessageBoxButtons.No) {
        this._result = MessageBoxButtons.No;
      } else {
        this._result = MessageBoxButtons.OK;
      }
    }

    this._primaryButtons = this.props.primaryButtons ? this.props.primaryButtons : 0;
  }


  get result() {
    return this._result;
  }


  __renderButton(button) {
    if (!(this._buttons & button)) {
      return (null);
    }

    let text;
    switch (button) {
      case MessageBoxButtons.OK:
        text = loc("OK");
        break;
      case MessageBoxButtons.Cancel:
        text = loc("Cancel");
        break;
      case MessageBoxButtons.Yes:
        text = loc("Yes");
        break;
      case MessageBoxButtons.No:
        text = loc("No");
        break;
      default:
        break;
    }

    let onClick = e => {
      this._result = e.target.value;
      $(`#${this._id}`).modal("hide");
    };

    let buttonClass = "btn bd-btn";
    if (this._primaryButtons & button) {
      buttonClass += " btn-primary";
    } else {
      buttonClass += " btn-secondary";
    }

    return (
      <button type="button" class={buttonClass} onClick={onClick} value={button}>{text}</button>
    );
  }


  render() {
    let onHidden = e => {
      if (this.props.onHidden) {
        this.props.onHidden(e, this.result);
      }
    };

    let bg;
    switch (this.props.level) {
      case MessageBoxLevel.Info:
        bg = "bg-info";
        break;
      case MessageBoxLevel.Warning:
        bg = "bg-warning";
        break;
      case MessageBoxLevel.Error:
        bg = "bg-danger";
        break;
      default:
        bg = "bg-secondary";
        break;
    }

    return (
      <Dialog id={this._id} onHidden={onHidden}>
        <DialogHeader showCloseButton="true" title={this.props.title} fg="text-white" bg={bg}></DialogHeader>
        <DialogBody>
          <div class="py-5">
            { this.props.message }
          </div>
        </DialogBody>
        <DialogFooter>
          { this.__renderButton(MessageBoxButtons.OK) }
          { this.__renderButton(MessageBoxButtons.Cancel) }
          { this.__renderButton(MessageBoxButtons.Yes) }
          { this.__renderButton(MessageBoxButtons.No) }
        </DialogFooter>
      </Dialog>
    );
  }


  static show(title, message, buttons, primary, level, onclose) {
    return Dialog.show(
      <MessageBox key={UI.nextGlobalId()} title={title} message={message}
                  buttons={buttons} primaryButtons={primary} level={level} onHidden={onclose} />
    );
  }
}


module.exports = {
  Dialog : Dialog,
  DialogHeader : DialogHeader,
  DialogBody : DialogBody,
  DialogFooter : DialogFooter,
  MessageBoxButtons : MessageBoxButtons,
  MessageBoxLevel : MessageBoxLevel,
  MessageBox : MessageBox
};
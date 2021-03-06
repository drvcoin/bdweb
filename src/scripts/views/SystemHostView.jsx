const View = require("../View.jsx").View;
const UI = require("../Ui.js").UI;
const loc = UI.loc;
const _dialog = require("../controls/Dialog.jsx");
const Dialog = _dialog.Dialog;
const DialogHeader = _dialog.DialogHeader;
const DialogBody = _dialog.DialogBody;
const DialogFooter = _dialog.DialogFooter;
const MessageBox = _dialog.MessageBox;
const MessageBoxButtons = _dialog.MessageBoxButtons;
const Api = require("../Api.js").Api;


class SystemHostView extends View {
  constructor(props) {
    super(props);
  }


  __renderHostTable() {
    let onDelete = function(hostId) {
      MessageBox.show(loc("Confirmation"), loc("Host_Delete_Confirm").format(hostId),
        MessageBoxButtons.Yes | MessageBoxButtons.No, MessageBoxButtons.No, 2,
        function(evt, result) {
          if (result === MessageBoxButtons.Yes) {
            let host = new Api(`name://Hosts/${hostId}`);
            host.call("Delete").then(() => UI.refresh());
          }
        }
      );
    };


    let onRefresh = function(hostId) {
      let host = new Api(`name://Hosts/${hostId}`);
      host.call("UpdateProperties").then(() => UI.refresh());
    };

    return (
      <table class="table table-responsive-sm table-responsive-md table-striped align-middle mb-4">
        <thead>
          <th scope="col">{ loc("ID") }</th>
          <th scope="col">{ loc("Address") }</th>
          <th scope="col">{ loc("Available Space") }</th>
          <th scope="col">{ loc("Total Space") }</th>
          <th scope="col">{ loc("Last Updated Time") }</th>
          <th scope="col"></th>
        </thead>
        <tbody>
          {
            this.model.hosts.map(host => (
              <tr>
                <td>{ host.Properties.Id }</td>
                <td>{ host.Properties.Address }</td>
                <td>{ UI.size.toString(host.Properties.AvailableSpace) }</td>
                <td>{ UI.size.toString(host.Properties.TotalSpace) }</td>
                <td>{ UI.timestamp.toLocaleString(host.Properties.LastUpdateTime) }</td>
                <td>
                  <button type="button" class="btn btn-outline-dark mr-1" onClick={e => onRefresh(host.Properties.Id)}>
                    <i class="fa fa-refresh"></i>
                  </button>
                  <a class="btn btn-outline-dark mr-1" href={`/api/name/Hosts/${host.Properties.Id}/DownloadConfig`}>
                    <i class="fa fa-download"></i>
                  </a>
                  <button type="button" class="btn btn-outline-dark" onClick={e => onDelete(host.Properties.Id)}>
                    <i class="fa fa-trash-o"></i>
                  </button>
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
    );
  }


  __renderRegisterDialog() {
    let renderButton = (text, style, dismiss, onclick) => {
      return (
        <button type="button" class={`btn bd-btn ${style}`} onClick={onclick}
                data-dismiss={dismiss ? "modal" : undefined}>
          {text}
        </button>
      );
    };

    let hostId = "";
    let onChange = event => {
      hostId = event.target.value;
    };

    let onOK = event => {
      let value = hostId.trim();
      if (value.length < 1) {
        throw Error(loc("Invalid Host ID."));
      }

      let target = event.target;
      target.disabled = true;

      let worker = async() => {
        let systemHost = new Api("system://Host");
        await systemHost.call("RegisterHost", { id : value });

        let host = new Api(`name://Hosts/${value}`);
        return host.call("UpdateProperties");
      };

      worker().then(result => {
        $("#registerHostDialog").modal("hide");
        MessageBox.show(loc("Configure Host"), loc("Host_Config_Download"),
          MessageBoxButtons.Yes | MessageBoxButtons.No, MessageBoxButtons.Yes, 0,
          function(evt, result) {
            if (result === MessageBoxButtons.Yes) {
              window.open(`/api/name/Hosts/${value}/DownloadConfig`);
            }

            UI.refresh();
          }
        );
      }).catch(ex => {
        target.disabled = false;
        throw ex;
      });
    };

    return (
      <Dialog id="registerHostDialog">
        <DialogHeader title={loc("Register Host")} />
        <DialogBody>
          <form class="p-3">
            <p>{ loc("Help_FindHostID") }</p>
            <p>{ loc("Label_InputHostID") }</p>
            <div class="mt-5 form-group row">
              <label for="inputHostId" class="col-sm-3 col-form-label">{loc("Host ID")}</label>
              <input type="text" class="form-control col-sm-8" id="inputHostId" placeholder={loc("Input host ID here")} onChange={onChange}></input>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          { renderButton(loc("OK"), "btn-outline-secondary", false, onOK) }
          { renderButton(loc("Cancel"), "btn-outline-secondary", true) }
        </DialogFooter>
      </Dialog>
    );
  }


  onRender() {
    return (
      <div>
        <h1 class="mb-4">{ loc("My Hosts") } <span class="badge badge-pill badge-info bd-badge-corner mt-2">{ this.model.hosts.length }</span></h1>
        { this.model.hosts && this.model.hosts.length > 0
          ? this.__renderHostTable()
          : <p class="mb-4">{ loc("You do not have any registered hosts.") }</p>
        }
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#registerHostDialog">{ loc("Register Host") }</button>
        { this.__renderRegisterDialog() }
      </div>
    );
  }
}


module.exports = {
  SystemHostView : SystemHostView
};

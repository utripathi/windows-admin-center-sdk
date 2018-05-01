// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ActivatedRouteSnapshot } from '@angular/router';
import { AppContextService } from '@msft-sme/shell/angular';

@Component({
    selector: 'sme-ng2-layers',
    templateUrl: './layers.component.html'
})
export class LayersComponent {

    public static navigationTitle(appContextService: AppContextService, snapshot: ActivatedRouteSnapshot): string {
        return 'Layers';
    }
}
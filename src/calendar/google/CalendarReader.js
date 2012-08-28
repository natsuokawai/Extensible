Ext.define('Extensible.calendar.google.CalendarReader', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.extensible.googlecalendar',
    
    requires: [
        'Extensible.calendar.google.EventMappings'
    ],

    root: 'items',
    
    googleConstants: {
        Status: {
            CONFIRMED: 'confirmed',
            TENTATIVE: 'tentative',
            CANCELLED: 'cancelled'
        }
    },
    
    readRecords: function(rawData) {
        var resultSet = this.callParent(arguments),
            EventMappings = Extensible.calendar.google.EventMappings,
            records = resultSet.records,
            len = records.length,
            data,
            i = 0,
            // Attributes to copy from the header into the records:
            timeZone = rawData.timeZone,
            accessRole = rawData.accessRole;
        
        for (i = 0; i < len; i++) {
            data = records[i].data;
            
            // If the event list header specifies a time zone, default that value into
            // any records that do not have an explicit time zone on the start or end dates:
            if (timeZone) {
                if (!data[EventMappings.StartTimeZone.name]) {
                    data[EventMappings.StartTimeZone.name] = timeZone;
                }
                if (!data[EventMappings.EndTimeZone.name]) {
                    data[EventMappings.EndTimeZone.name] = timeZone;
                }
            }
            
            // Google's event model does not specify accessRole, but since we need it at the event
            // level in Extensible to render the events properly just copy it into each event: 
            if (accessRole) {
                data[EventMappings.AccessRole.name] = accessRole;
            }
        }
        
        return resultSet;
    },
    
    extractData: function(root) {
        var records = this.callParent(arguments),
            EventMappings = Extensible.calendar.google.EventMappings,
            data,
            status,
            processed = [],
            len = records.length,
            i = 0;
        
        for (i = 0; i < len; i++) {
            data = records[i].data;
            status = data[EventMappings.Status.name];
            
            if (status && status === this.googleConstants.Status.CANCELLED) {
                // do not include cancelled events
                continue;
            }
            
            if (data[EventMappings.StartDateTime.name]) {
                data[EventMappings.StartDate.name] = data[EventMappings.StartDateTime.name];
                data[EventMappings.EndDate.name] = data[EventMappings.EndDateTime.name];
                data[EventMappings.IsAllDay.name] = true;
                
                delete data[EventMappings.StartDateTime.name];
                delete data[EventMappings.EndDateTime.name];
            }
            
            processed.push(records[i]);
        }
        return processed;
    }
});
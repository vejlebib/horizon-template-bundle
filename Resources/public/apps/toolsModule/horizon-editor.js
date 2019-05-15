angular.module('toolsModule').directive('horizonEditor', [
  'mediaFactory', '$timeout', function (mediaFactory, $timeout) {
    return {
      restrict: 'E',
      replace: true,
      scope: {
        slide: '=',
        close: '&'
      },
      link: function (scope) {
        var index = null;

        scope.step = null;

        scope.selectedMedia = [];

        /**
         * Set the step to background-picker.
         */
        scope.backgroundPicker = function backgroundPicker(pickedIndex) {
          index = pickedIndex;

          scope.step = 'background-picker';
        };

        /**
         * Set the step to pick-from-media.
         */
        scope.pickFromMedia = function pickFromMedia() {
          var region = scope.slide.options.regions[index];

          if (region.mediaIndex !== "" &&
            region.mediaIndex !== null &&
            region.mediaIndex !== undefined) {
            scope.selectedMedia = [scope.slide.media[region.mediaIndex]];
          }

          scope.step = 'pick-from-media';
        };

        /**
         * Set the step to pick-from-computer.
         */
        scope.pickFromComputer = function pickFromComputer() {
          scope.step = 'pick-from-computer';
        };

        scope.back = function back() {
          scope.selectedMedia = [];
          scope.step = null;
          index = null;
        };

        /**
         * Remove invalid media references and update region.mediaIndex if
         * indexes have changed.
         */
        var updateMediaReferences = function () {
          var mediaIndexesUsed = scope.slide.options.regions.reduce(function (sum, value) {
            if (value.mediaIndex !== "" &&
              value.mediaIndex !== null &&
              value.mediaIndex !== undefined) {
              if (sum.indexOf(value.mediaIndex) === -1) {
                sum.push(value.mediaIndex);
              }
            }

            return sum;
          }, []);

          var cleanedMedia = [];

          for (var i = 0; i < scope.slide.media.length; i++) {
            if (mediaIndexesUsed.indexOf(i) === -1) {
              for (var region in scope.slide.options.regions) {
                region = scope.slide.options.regions[region];

                if (region.mediaIndex > i) {
                  region.mediaIndex = region.mediaIndex - 1;
                }
              }
            }
            else {
              cleanedMedia.push(scope.slide.media[i]);
            }
          }

          scope.slide.media = cleanedMedia;
        };

        /**
         * Add a media from scope.slide.media.
         *
         * Update mediaIndex references in slide.options.regions.
         *
         * @param clickedMedia
         */
        var clickMedia = function (clickedMedia) {
          var mediaList = [];
          var found = false;
          var mediaIndex = null;

          for (var i in scope.slide.media) {
            var media = scope.slide.media[i];

            if (media.id === clickedMedia.id) {
              found = true;
              mediaIndex = i;
            }
            mediaList.push(media);
          }

          if (!found) {
            mediaList.push(clickedMedia);
            mediaIndex = mediaList.length - 1;
          }

          scope.step = null;
          scope.slide.media = mediaList;
          scope.slide.options.regions[index].mediaIndex = mediaIndex;

          updateMediaReferences();
        };

        // Register event listener for select media.
        scope.$on('mediaOverview.selectMedia', function (event, media) {
          clickMedia(media);
        });

        // Register event listener for media upload success.
        scope.$on('mediaUpload.uploadSuccess', function (event, data) {
          mediaFactory.getMedia(data.id).then(
            function success(media) {
              scope.slide.media.push(media);
              scope.slide.options.regions[index].mediaIndex = scope.slide.media.length - 1;
            },
            function error(reason) {
              busService.$emit('log.error', {
                'cause': reason,
                'msg': 'Kunne ikke tilføje media.'
              });
            }
          );

          var notAllSuccess = data.queue.find(function (item, index) {
            return !item.isSuccess;
          });

          if (!notAllSuccess) {
            scope.close();
          }
        });

      },
      templateUrl: '/bundles/os2displayhorizontemplate/apps/toolsModule/horizon-editor.html'
    };
  }
]);
